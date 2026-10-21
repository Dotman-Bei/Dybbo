// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @notice Minimal ERC-721 standing in for Chog Genesis in unit tests. Token IDs 1 to 1,969, and the
/// same OpenZeppelin v5 custom errors the real contract reverts with.
contract MockChog {
    error ERC721InsufficientApproval(address operator, uint256 tokenId);
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);
    error ERC721NonexistentToken(uint256 tokenId);

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    mapping(uint256 => address) private _owners;
    mapping(uint256 => address) private _approved;
    mapping(address => mapping(address => bool)) private _operators;

    function mint(address to, uint256 id) external {
        _owners[id] = to;
        emit Transfer(address(0), to, id);
    }

    function ownerOf(uint256 id) public view returns (address o) {
        o = _owners[id];
        if (o == address(0)) revert ERC721NonexistentToken(id);
    }

    function getApproved(uint256 id) external view returns (address) {
        ownerOf(id);
        return _approved[id];
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operators[owner][operator];
    }

    function approve(address to, uint256 id) external {
        address o = ownerOf(id);
        if (msg.sender != o && !_operators[o][msg.sender]) revert ERC721InsufficientApproval(msg.sender, id);
        _approved[id] = to;
        emit Approval(o, to, id);
    }

    function setApprovalForAll(address operator, bool ok) external {
        _operators[msg.sender][operator] = ok;
        emit ApprovalForAll(msg.sender, operator, ok);
    }

    function transferFrom(address from, address to, uint256 id) public {
        address o = ownerOf(id);
        if (o != from) revert ERC721IncorrectOwner(from, id, o);
        if (msg.sender != o && _approved[id] != msg.sender && !_operators[o][msg.sender]) {
            revert ERC721InsufficientApproval(msg.sender, id);
        }
        delete _approved[id];
        _owners[id] = to;
        emit Transfer(from, to, id);
    }
}
