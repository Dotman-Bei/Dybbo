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
    uint256 public constant RECENT = 64;

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
    error NothingToClaim();
    error Reentrancy();
    error TransferFailed();

    // ---------------------------------------------------------------- events (PRD §8.6)

    event Possessed(uint256 indexed id, address indexed possessor, address ownerAtStart, uint256 until, uint256 fee);
    event Haunted(uint256 indexed sourceId, uint256 indexed targetId, address indexed actor, uint8 markId, bool byPossessor);
    event Claimed(uint256 indexed id, address indexed to, uint256 amount);
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

    /// The home feed without an indexer (public RPCs cap eth_getLogs at 100 blocks). Two slots each.
    struct Activity {
        uint8 kind; // 0 possess, 1 haunt, 2 claim
        uint16 id;
        uint16 targetId;
        address actor;
        uint8 markId;
        bool byPossessor;
        uint40 at;
        uint96 amount;
        uint8 mins;
    }

    struct Status {
        bool leased;
        uint40 until;
        address possessor;
        uint96 price;
        bool closed;
        bool defaults;
        uint256 escrow;
    }

    Activity[64] internal _recent;
    uint8 internal _recentHead;

    uint256 public totalPossessions;
    uint256 public totalHaunts;
    uint256 public totalPaid;
    uint256 public totalClaimed;
    uint256 public distinctPossessors;
    uint256 public distinctTokens;
    mapping(address => bool) internal _seenPossessor;
    mapping(uint256 => bool) internal _seenToken;

    uint256 private _locked = 1;

    modifier nonReentrant() {
        if (_locked != 1) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

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

        ++totalPossessions;
        totalPaid += msg.value;
        if (!_seenPossessor[msg.sender]) {
            _seenPossessor[msg.sender] = true;
            ++distinctPossessors;
        }
        if (!_seenToken[id]) {
            _seenToken[id] = true;
            ++distinctTokens;
        }
        _record(Activity(0, uint16(id), 0, msg.sender, 0, false, uint40(block.timestamp), uint96(msg.value), mins));

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

        ++totalHaunts;
        _record(Activity(1, uint16(sourceId), uint16(targetId), msg.sender, markId, byPossessor, at, 0, 0));

        emit Haunted(sourceId, targetId, msg.sender, markId, byPossessor);
    }

    /// @notice Whether `caller` could haunt `targetId` with `sourceId` right now, and if not, why.
    function canHaunt(address caller, uint256 sourceId, uint256 targetId) external view returns (bool ok, uint8 reason) {
        (reason,) = _checkHaunt(caller, sourceId, targetId, 0);
        return (reason == OK, reason);
    }

    // ---------------------------------------------------------------- claims

    /// @notice Pay `id`'s whole escrow to its current holder. Unclaimed fees follow the token.
    function claim(uint256 id) external nonReentrant {
        uint256 amount = _take(id);
        if (amount == 0) revert NothingToClaim();
        _pay(amount);
    }

    /// @notice Claim several Chogs in one call. The caller must hold every one of them.
    function claimMany(uint256[] calldata ids) external nonReentrant {
        uint256 total;
        for (uint256 i; i < ids.length; ++i) total += _take(ids[i]);
        if (total == 0) revert NothingToClaim();
        _pay(total);
    }

    /// Checks the holder and zeroes the escrow before any MON moves.
    function _take(uint256 id) internal returns (uint256 amount) {
        _inRange(id);
        if (CHOG.ownerOf(id) != msg.sender) revert NotOwner();
        amount = _escrow[id];
        if (amount == 0) return 0;
        _escrow[id] = 0;
        totalClaimed += amount;
        _record(Activity(2, uint16(id), 0, msg.sender, 0, false, uint40(block.timestamp), uint96(amount), 0));
        emit Claimed(id, msg.sender, amount);
    }

    function _pay(uint256 amount) internal {
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
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
        return (uint96(p), closed, defaults, _isContract(holder));
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

    /// @notice The last 64 actions, newest first.
    function recentActivity() external view returns (Activity[] memory out) {
        uint256 n;
        for (uint256 i; i < RECENT; ++i) if (_recent[i].at != 0) ++n;
        out = new Activity[](n);
        uint256 head = _recentHead;
        for (uint256 k; k < n; ++k) out[k] = _recent[(head + RECENT - 1 - k) % RECENT];
    }

    function stats()
        external
        view
        returns (uint256 possessions, uint256 haunts, uint256 paid, uint256 claimed, uint256 possessors, uint256 tokens)
    {
        return (totalPossessions, totalHaunts, totalPaid, totalClaimed, distinctPossessors, distinctTokens);
    }

    /// @notice Live status for tokens `from` to `to` inclusive, for the browse page. Chog Genesis is not
    /// enumerable, so this reads ownerOf for each token in one call.
    function statusBatch(uint256 from, uint256 to) external view returns (Status[] memory out) {
        _inRange(from);
        _inRange(to);
        if (to < from) revert TokenOutOfRange();
        out = new Status[](to - from + 1);
        for (uint256 id = from; id <= to; ++id) {
            address holder = CHOG.ownerOf(id);
            Lease storage l = _lease[id];
            bool leased = _active(l, holder);
            (uint256 price, bool closed, bool defaults) = _effectiveTerms(id, holder);
            out[id - from] = Status(
                leased, leased ? l.until : 0, leased ? l.possessor : address(0), uint96(price), closed, defaults, _escrow[id]
            );
        }
    }

    // ---------------------------------------------------------------- internals

    function _record(Activity memory a) internal {
        uint8 head = _recentHead;
        _recent[head] = a;
        _recentHead = uint8((head + 1) % RECENT);
    }

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

    /// True for real contracts (vaults, pools, Safes). An EIP-7702 wallet's only code is the 23-byte
    /// delegation designator 0xef0100 ‖ address; it is still one person's wallet, so it counts as a wallet.
    function _isContract(address a) internal view returns (bool) {
        uint256 size = a.code.length;
        if (size == 0) return false;
        if (size != 23) return true;
        bytes memory c = a.code;
        return !(c[0] == 0xef && c[1] == 0x01 && c[2] == 0x00);
    }

    /// Wallets, including EIP-7702 smart-account wallets, are open at the default price from the first
    /// block. Contract holders (vaults, pools, Safes) start closed, so a borrowed Chog can't drain its escrow.
    function _effectiveTerms(uint256 id, address holder) internal view returns (uint256 price, bool closed, bool defaults) {
        Terms memory t = _terms[id];
        if (t.setBy == holder && holder != address(0)) return (t.price, t.closed, false);
        return (DEFAULT_PRICE, _isContract(holder), true);
    }
}
