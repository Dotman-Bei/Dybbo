// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Base} from "./Base.t.sol";
import {Dybbo} from "../src/Dybbo.sol";

/// A holder contract that tries to claim again while it is being paid.
contract Reenterer {
    Dybbo public d;
    uint256 public id;
    bool public tried;
    bytes public reason;

    constructor(Dybbo d_) {
        d = d_;
    }

    function open(uint256 id_) external {
        id = id_;
        d.setTerms(id_, uint96(d.DEFAULT_PRICE()), false);
    }

    function claim() external {
        d.claim(id);
    }

    receive() external payable {
        if (tried) return;
        tried = true;
        try d.claim(id) {} catch (bytes memory r) {
            reason = r;
        }
    }
}

contract ClaimTest is Base {
    function test_ClaimByNonOwnerReverts() public {
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.claim(1);
        vm.prank(stranger);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.claim(1);
    }

    function test_HolderClaimsExactlyTheEscrow() public {
        _possess(possessor, 1, 5);
        _possess(stranger, 2, 3);
        uint256 before = holder.balance;
        vm.expectEmit(address(dybbo));
        emit Dybbo.Claimed(1, holder, 0.05 ether);
        vm.prank(holder);
        dybbo.claim(1);
        assertEq(holder.balance - before, 0.05 ether);
        assertEq(dybbo.escrowOf(1), 0);
        assertEq(dybbo.escrowOf(2), 0.03 ether);
        assertEq(address(dybbo).balance, 0.03 ether);
    }

    function test_RevertWhen_NothingToClaim() public {
        vm.prank(holder);
        vm.expectRevert(Dybbo.NothingToClaim.selector);
        dybbo.claim(1);
    }

    function test_EscrowFollowsTokenAfterSale() public {
        _possess(possessor, 1, 4);
        vm.prank(holder);
        chog.transferFrom(holder, buyer, 1);
        vm.prank(holder);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.claim(1);
        vm.prank(buyer);
        dybbo.claim(1);
        assertEq(buyer.balance, 0.04 ether);
    }

    function test_ClaimMany() public {
        _possess(possessor, 1, 1);
        _possess(possessor, 2, 2);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;
        vm.prank(holder);
        dybbo.claimMany(ids);
        assertEq(holder.balance, 0.03 ether);
        assertEq(dybbo.escrowOf(1) + dybbo.escrowOf(2), 0);
    }

    function test_ClaimManySkipsEmptyButRequiresOwnership() public {
        _possess(possessor, 1, 1);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2; // held, but empty
        vm.prank(holder);
        dybbo.claimMany(ids);
        assertEq(holder.balance, 0.01 ether);

        ids[1] = 3; // not held by the caller
        vm.prank(holder);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.claimMany(ids);
    }

    function test_RevertWhen_ClaimManyAllEmpty() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;
        vm.prank(holder);
        vm.expectRevert(Dybbo.NothingToClaim.selector);
        dybbo.claimMany(ids);
    }

    function test_ReentrantClaimIsBlocked() public {
        Reenterer r = new Reenterer(dybbo);
        chog.mint(address(r), 7);
        r.open(7);
        _possess(possessor, 7, 3);
        r.claim();
        assertTrue(r.tried());
        assertEq(bytes4(r.reason()), Dybbo.Reentrancy.selector);
        assertEq(address(r).balance, 0.03 ether);
        assertEq(address(dybbo).balance, 0);
    }
}
