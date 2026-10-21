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
    uint256 public constant HAUNT_COOLDOWN = 15 seconds;
    uint256 public constant TARGET_REPEAT_WINDOW = 24 hours;
    uint256 public constant MARK_TTL = 24 hours;
    uint256 public constant MARKS_PER_TOKEN = 8;
    uint256 public constant MARK_COUNT = 3;

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
    error NotController();
    error SameToken();
    error Cooldown();
    error TargetRepeat();
    error BadMark();

    // ---------------------------------------------------------------- events (PRD §8.6)

    event Possessed(uint256 indexed id, address indexed possessor, address ownerAtStart, uint256 until, uint256 fee);
    event Haunted(uint256 indexed sourceId, uint256 indexed targetId, address indexed actor, uint8 markId, bool byPossessor);
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

    /// One slot per mark; each target keeps its last eight in a ring.
    struct Mark {
        uint16 sourceId;
        address actor;
        uint8 markId;
        uint40 at;
        bool byPossessor;
    }

    mapping(uint256 => Mark[8]) internal _marks;
    mapping(uint256 => uint8) internal _markHead;
    mapping(uint256 => uint40) public lastHauntAt;
    mapping(uint256 => mapping(uint256 => uint40)) internal _lastPairAt;

    /// Reason codes for `canHaunt`, in the order the frontend decodes them.
    uint8 internal constant OK = 0;
    uint8 internal constant R_TOKEN_OUT_OF_RANGE = 1;
    uint8 internal constant R_CLOSED = 2;
    uint8 internal constant R_LEASE_ACTIVE = 3;
    uint8 internal constant R_LEASE_EXPIRED = 4;
    uint8 internal constant R_OWNER_CHANGED = 5;
    uint8 internal constant R_NOT_CONTROLLER = 11;
    uint8 internal constant R_SAME_TOKEN = 12;
    uint8 internal constant R_COOLDOWN = 13;
    uint8 internal constant R_TARGET_REPEAT = 14;
    uint8 internal constant R_BAD_MARK = 15;

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

    // ---------------------------------------------------------------- haunt

    /// @notice Leave mark `markId` on `targetId`, acting as `sourceId`. The possessor of a live lease acts
    /// with it; with no live lease, its holder acts with it directly (holder mode).
    function haunt(uint256 sourceId, uint256 targetId, uint8 markId) external {
        (uint8 reason, bool byPossessor) = _checkHaunt(msg.sender, sourceId, targetId, markId);
        if (reason != OK) _revertWith(reason);

        uint40 at = uint40(block.timestamp);
        uint8 head = _markHead[targetId];
        _marks[targetId][head] = Mark(uint16(sourceId), msg.sender, markId, at, byPossessor);
        _markHead[targetId] = uint8((head + 1) % MARKS_PER_TOKEN);
        lastHauntAt[sourceId] = at;
        _lastPairAt[sourceId][targetId] = at;

        emit Haunted(sourceId, targetId, msg.sender, markId, byPossessor);
    }

    /// @notice Whether `caller` could haunt `targetId` with `sourceId` right now, and if not, why.
    function canHaunt(address caller, uint256 sourceId, uint256 targetId) external view returns (bool ok, uint8 reason) {
        (reason,) = _checkHaunt(caller, sourceId, targetId, 0);
        return (reason == OK, reason);
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

    /// @notice Marks on `id` from the last 24 hours, at most eight, in ring order.
    function marksOf(uint256 id) external view returns (Mark[] memory live) {
        Mark[8] storage ring = _marks[id];
        uint256 n;
        for (uint256 i; i < MARKS_PER_TOKEN; ++i) {
            if (ring[i].at != 0 && block.timestamp - ring[i].at < MARK_TTL) ++n;
        }
        live = new Mark[](n);
        n = 0;
        for (uint256 i; i < MARKS_PER_TOKEN; ++i) {
            if (ring[i].at != 0 && block.timestamp - ring[i].at < MARK_TTL) live[n++] = ring[i];
        }
    }

    // ---------------------------------------------------------------- internals

    function _inRange(uint256 id) internal pure {
        if (id == 0 || id > SUPPLY) revert TokenOutOfRange();
    }

    /// Every rule a haunt must pass, in the order the errors are reported. Shared by `haunt` and `canHaunt`.
    function _checkHaunt(address caller, uint256 sourceId, uint256 targetId, uint8 markId)
        internal
        view
        returns (uint8 reason, bool byPossessor)
    {
        if (sourceId == 0 || sourceId > SUPPLY || targetId == 0 || targetId > SUPPLY) return (R_TOKEN_OUT_OF_RANGE, false);
        address holder = CHOG.ownerOf(sourceId);
        Lease storage l = _lease[sourceId];
        if (l.possessor == caller && caller != address(0)) {
            // Possessor: the lease must be live, checked against ownerOf in this same call.
            if (holder != l.ownerAtStart) return (R_OWNER_CHANGED, true);
            if (block.timestamp >= l.until) return (R_LEASE_EXPIRED, true);
            byPossessor = true;
        } else if (holder == caller) {
            // Holder mode: only while nobody else holds a live lease on this Chog.
            if (_active(l, holder)) return (R_LEASE_ACTIVE, false);
        } else {
            return (R_NOT_CONTROLLER, false);
        }
        if (sourceId == targetId) return (R_SAME_TOKEN, byPossessor);
        if (markId >= MARK_COUNT) return (R_BAD_MARK, byPossessor);
        (,bool targetClosed,) = _effectiveTerms(targetId, CHOG.ownerOf(targetId));
        if (targetClosed) return (R_CLOSED, byPossessor);
        if (block.timestamp - lastHauntAt[sourceId] < HAUNT_COOLDOWN) return (R_COOLDOWN, byPossessor);
        uint40 pair = _lastPairAt[sourceId][targetId];
        if (pair != 0 && block.timestamp - pair < TARGET_REPEAT_WINDOW) return (R_TARGET_REPEAT, byPossessor);
        return (OK, byPossessor);
    }

    function _revertWith(uint8 reason) internal pure {
        if (reason == R_TOKEN_OUT_OF_RANGE) revert TokenOutOfRange();
        if (reason == R_CLOSED) revert Closed();
        if (reason == R_LEASE_ACTIVE) revert LeaseActive();
        if (reason == R_LEASE_EXPIRED) revert LeaseExpired();
        if (reason == R_OWNER_CHANGED) revert OwnerChanged();
        if (reason == R_NOT_CONTROLLER) revert NotController();
        if (reason == R_SAME_TOKEN) revert SameToken();
        if (reason == R_COOLDOWN) revert Cooldown();
        if (reason == R_TARGET_REPEAT) revert TargetRepeat();
        revert BadMark();
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
