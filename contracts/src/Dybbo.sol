// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface IChog {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title Dybbo
/// @notice Possess any Chog Genesis for a few paid minutes. The fee is escrowed to the token and only
/// its holder at claim time can take it. Control is checked against `ownerOf` on every action, so it
/// ends in the block the lease expires or the Chog changes hands.
/// @dev The only calls this contract makes to Chog Genesis are `ownerOf`. It never approves, transfers
/// or holds a Chog, and it has no owner, no pause, no upgrade path and no fee.
contract Dybbo {
    // ---------------------------------------------------------------- constants (PRD §8.2)

    uint256 public constant SUPPLY = 1969;
    uint256 public constant MIN_MINUTES = 1;
    uint256 public constant MAX_MINUTES = 10;

    IChog public immutable CHOG;
    uint256 public immutable DEFAULT_PRICE;
    uint256 public immutable MIN_PRICE;
    uint256 public immutable MAX_PRICE;

    // ---------------------------------------------------------------- errors (PRD §8.7)

    error TokenOutOfRange();
    error Closed();
    error LeaseActive();
    error LeaseExpired();
    error OwnerChanged();
    error SelfDybbo();
    error WrongPayment();
    error DurationOutOfRange();
    error PriceOutOfRange();
    error NotOwner();

    // ---------------------------------------------------------------- events (PRD §8.6)

    event Possessed(uint256 indexed id, address indexed possessor, address ownerAtStart, uint256 until, uint256 fee);
    event TermsSet(uint256 indexed id, address indexed holder, uint256 pricePerMinute, bool closed);

    // ---------------------------------------------------------------- storage (PRD §8.3)

    /// Two slots: who and until (with the start), then the holder it was paid to and the fee.
    struct Lease {
        address possessor;
        uint40 until;
        uint40 start;
        address ownerAtStart;
        uint96 fee;
    }

    /// One slot. Terms belong to the holder who set them; anyone else gets the defaults.
    struct Terms {
        uint64 price;
        bool closed;
        address setBy;
    }

    mapping(uint256 => Lease) internal _lease;
    mapping(uint256 => Terms) internal _terms;
    mapping(uint256 => uint256) internal _escrow;

    constructor(IChog chog, uint256 defaultPrice, uint256 minPrice, uint256 maxPrice) {
        require(minPrice > 0 && minPrice <= defaultPrice && defaultPrice <= maxPrice && maxPrice <= type(uint64).max);
        CHOG = chog;
        DEFAULT_PRICE = defaultPrice;
        MIN_PRICE = minPrice;
        MAX_PRICE = maxPrice;
    }

    // ---------------------------------------------------------------- lease

    /// @notice Possess `id` for `mins`, paying exactly price × mins into its escrow.
    function possess(uint256 id, uint8 mins) external payable {
        _inRange(id);
        address holder = CHOG.ownerOf(id);
        if (holder == msg.sender) revert SelfDybbo();
        (uint256 price, bool closed,) = _effectiveTerms(id, holder);
        if (closed) revert Closed();
        Lease storage l = _lease[id];
        if (_active(l, holder)) revert LeaseActive();
        if (mins < MIN_MINUTES || mins > MAX_MINUTES) revert DurationOutOfRange();
        if (msg.value != price * mins) revert WrongPayment();

        uint40 until = uint40(block.timestamp + uint256(mins) * 60);
        _lease[id] = Lease(msg.sender, until, uint40(block.timestamp), holder, uint96(msg.value));
        _escrow[id] += msg.value;

        emit Possessed(id, msg.sender, holder, until, msg.value);
    }

    // ---------------------------------------------------------------- holder terms

    /// @notice Set a price or close a Chog. Only its current holder; a buyer starts on the defaults.
    function setTerms(uint256 id, uint96 pricePerMinute, bool closed) external {
        _inRange(id);
        if (CHOG.ownerOf(id) != msg.sender) revert NotOwner();
        if (pricePerMinute < MIN_PRICE || pricePerMinute > MAX_PRICE) revert PriceOutOfRange();
        _terms[id] = Terms(uint64(pricePerMinute), closed, msg.sender);
        emit TermsSet(id, msg.sender, pricePerMinute, closed);
    }

    // ---------------------------------------------------------------- views

    /// @notice The lease record; `active` is whether it is live right now against the current holder.
    function leaseOf(uint256 id)
        external
        view
        returns (address possessor, uint40 until, address ownerAtStart, bool active, uint40 startedAt, uint96 fee)
    {
        Lease memory l = _lease[id];
        active = l.possessor != address(0) && _active(_lease[id], CHOG.ownerOf(id));
        return (l.possessor, l.until, l.ownerAtStart, active, l.start, l.fee);
    }

    /// @notice Effective terms: `defaults` is true when the holder has not set their own; `holderIsContract`
    /// is true when the holder has code.
    function termsOf(uint256 id) external view returns (uint96 price, bool closed, bool defaults, bool holderIsContract) {
        address holder = CHOG.ownerOf(id);
        uint256 p;
        (p, closed, defaults) = _effectiveTerms(id, holder);
        return (uint96(p), closed, defaults, holder.code.length > 0);
    }

    function escrowOf(uint256 id) external view returns (uint256) {
        return _escrow[id];
    }

    // ---------------------------------------------------------------- internals

    function _inRange(uint256 id) internal pure {
        if (id == 0 || id > SUPPLY) revert TokenOutOfRange();
    }

    /// A lease is live while the clock has not reached `until` and the holder is the one it was paid to.
    function _active(Lease storage l, address holder) internal view returns (bool) {
        return block.timestamp < l.until && l.ownerAtStart == holder;
    }

    /// Wallets without code are open at the default price from the first block. Holders with code
    /// (vaults, pools, Safes, EIP-7702 wallets) start closed, so a borrowed Chog can't drain its escrow.
    function _effectiveTerms(uint256 id, address holder) internal view returns (uint256 price, bool closed, bool defaults) {
        Terms memory t = _terms[id];
        if (t.setBy == holder && holder != address(0)) return (t.price, t.closed, false);
        return (DEFAULT_PRICE, holder.code.length > 0, true);
    }
}
