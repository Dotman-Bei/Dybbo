// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Base, Vault} from "./Base.t.sol";
import {Dybbo} from "../src/Dybbo.sol";

contract HauntTest is Base {
    function _haunt(address who, uint256 s, uint256 t, uint8 m) internal {
        vm.prank(who);
        dybbo.haunt(s, t, m);
    }

    function test_PossessorHauntsAndMarkShows() public {
        _possess(possessor, 1, 5);
        vm.expectEmit(address(dybbo));
        emit Dybbo.Haunted(1, 3, possessor, 2, true);
        _haunt(possessor, 1, 3, 2);

        Dybbo.Mark[] memory marks = dybbo.marksOf(3);
        assertEq(marks.length, 1);
        assertEq(marks[0].sourceId, 1);
        assertEq(marks[0].actor, possessor);
        assertEq(marks[0].markId, 2);
        assertTrue(marks[0].byPossessor);
        assertEq(dybbo.lastHauntAt(1), block.timestamp);
    }

    function test_HauntAtUntilRevertsLeaseExpired() public {
        _possess(possessor, 1, 1);
        (, uint40 until,,,,) = dybbo.leaseOf(1);
        vm.warp(until - 1);
        _haunt(possessor, 1, 3, 0);
        vm.warp(until);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.LeaseExpired.selector);
        dybbo.haunt(1, 4, 0);
    }

    function test_SaleMidLeaseRevertsOwnerChanged() public {
        _possess(possessor, 1, 10);
        _haunt(possessor, 1, 3, 0);
        vm.prank(holder);
        chog.transferFrom(holder, buyer, 1);
        vm.warp(block.timestamp + 20);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.OwnerChanged.selector);
        dybbo.haunt(1, 4, 0);
    }

    function test_HolderModeHaunt() public {
        _haunt(holder, 1, 3, 1);
        Dybbo.Mark[] memory marks = dybbo.marksOf(3);
        assertEq(marks.length, 1);
        assertFalse(marks[0].byPossessor);
        assertEq(marks[0].actor, holder);
    }

    function test_RevertWhen_HolderActsDuringLease() public {
        _possess(possessor, 1, 5);
        vm.prank(holder);
        vm.expectRevert(Dybbo.LeaseActive.selector);
        dybbo.haunt(1, 3, 0);
    }

    function test_HolderModeReturnsAfterLease() public {
        _possess(possessor, 1, 1);
        vm.warp(block.timestamp + 60);
        _haunt(holder, 1, 3, 0);
    }

    function test_RevertWhen_NotController() public {
        vm.prank(stranger);
        vm.expectRevert(Dybbo.NotController.selector);
        dybbo.haunt(1, 3, 0);
    }

    function test_RevertWhen_SameToken() public {
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.SameToken.selector);
        dybbo.haunt(1, 1, 0);
    }

    function test_RevertWhen_BadMark() public {
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.BadMark.selector);
        dybbo.haunt(1, 3, 3);
    }

    function test_RevertWhen_TargetClosed() public {
        vm.prank(holder2);
        dybbo.setTerms(3, uint96(DEFAULT), true);
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Closed.selector);
        dybbo.haunt(1, 3, 0);
    }

    function test_RevertWhen_TargetHeldByContract() public {
        Vault vault = new Vault();
        chog.mint(address(vault), 9);
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Closed.selector);
        dybbo.haunt(1, 9, 0);
    }

    function test_Cooldown() public {
        _possess(possessor, 1, 5);
        _haunt(possessor, 1, 3, 0);
        vm.warp(block.timestamp + 14);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Cooldown.selector);
        dybbo.haunt(1, 4, 0);
        vm.warp(block.timestamp + 1);
        _haunt(possessor, 1, 4, 0);
    }

    function test_OncePerTargetPerDay() public {
        _haunt(holder, 1, 3, 0);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(holder);
        vm.expectRevert(Dybbo.TargetRepeat.selector);
        dybbo.haunt(1, 3, 1);
        vm.warp(block.timestamp + 23 hours);
        _haunt(holder, 1, 3, 1);
    }

    function test_CooldownFollowsTheSourceNotTheActor() public {
        _haunt(holder, 1, 3, 0);
        _possess(possessor, 1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Cooldown.selector);
        dybbo.haunt(1, 4, 0);
    }

    function test_MarksKeepTheLastEight() public {
        // Ten different sources mark #1; only the newest eight remain.
        for (uint256 s = 2; s <= 11; ++s) {
            if (s > 4) chog.mint(makeAddr(vm.toString(s)), s);
            _haunt(chog.ownerOf(s), s, 1, 0);
        }
        Dybbo.Mark[] memory marks = dybbo.marksOf(1);
        assertEq(marks.length, 8);
        for (uint256 i; i < marks.length; ++i) assertGt(marks[i].sourceId, 3);
    }

    function test_MarksExpireAfterADay() public {
        _haunt(holder, 1, 3, 0);
        vm.warp(block.timestamp + 24 hours - 1);
        assertEq(dybbo.marksOf(3).length, 1);
        vm.warp(block.timestamp + 1);
        assertEq(dybbo.marksOf(3).length, 0);
    }

    function test_CanHauntReportsTheReason() public {
        (bool ok, uint8 reason) = dybbo.canHaunt(stranger, 1, 3);
        assertFalse(ok);
        assertEq(reason, 11); // NotController
        _possess(possessor, 1, 1);
        (ok, reason) = dybbo.canHaunt(possessor, 1, 3);
        assertTrue(ok);
        assertEq(reason, 0);
        vm.warp(block.timestamp + 60);
        (ok, reason) = dybbo.canHaunt(possessor, 1, 3);
        assertEq(reason, 4); // LeaseExpired
    }
}
