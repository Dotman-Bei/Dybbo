// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Base, Vault} from "./Base.t.sol";
import {Dybbo} from "../src/Dybbo.sol";

contract ViewsTest is Base {
    function test_StatsCountEverything() public {
        _possess(possessor, 1, 5);
        _possess(possessor, 3, 1);
        _possess(stranger, 2, 2);
        vm.prank(possessor);
        dybbo.haunt(1, 4, 0);
        vm.prank(holder);
        dybbo.claim(1);
        (uint256 possessions, uint256 haunts, uint256 paid, uint256 claimed, uint256 possessors, uint256 tokens) =
            dybbo.stats();
        assertEq(possessions, 3);
        assertEq(haunts, 1);
        assertEq(paid, 0.08 ether);
        assertEq(claimed, 0.05 ether);
        assertEq(possessors, 2);
        assertEq(tokens, 3);
        assertEq(paid - claimed, address(dybbo).balance);
    }

    function test_RecentActivityNewestFirst() public {
        _possess(possessor, 1, 2);
        vm.warp(block.timestamp + 1);
        vm.prank(possessor);
        dybbo.haunt(1, 3, 1);
        vm.warp(block.timestamp + 1);
        vm.prank(holder);
        dybbo.claim(1);

        Dybbo.Activity[] memory a = dybbo.recentActivity();
        assertEq(a.length, 3);
        assertEq(a[0].kind, 2);
        assertEq(a[0].amount, 0.02 ether);
        assertEq(a[1].kind, 1);
        assertEq(a[1].targetId, 3);
        assertEq(a[1].markId, 1);
        assertTrue(a[1].byPossessor);
        assertEq(a[2].kind, 0);
        assertEq(a[2].mins, 2);
        assertEq(a[2].actor, possessor);
    }

    function test_RecentActivityKeepsSixtyFour() public {
        for (uint256 i; i < 70; ++i) {
            _possess(possessor, 1, 1);
            vm.warp(block.timestamp + 60);
        }
        Dybbo.Activity[] memory a = dybbo.recentActivity();
        assertEq(a.length, 64);
        assertGt(a[0].at, a[63].at);
    }

    function test_StatusBatch() public {
        Vault vault = new Vault();
        chog.mint(address(vault), 5);
        _possess(possessor, 1, 5);
        vm.prank(holder2);
        dybbo.setTerms(3, 0.02 ether, false);

        Dybbo.Status[] memory st = dybbo.statusBatch(1, 5);
        assertEq(st.length, 5);
        assertTrue(st[0].leased);
        assertEq(st[0].possessor, possessor);
        assertEq(st[0].escrow, 0.05 ether);
        assertFalse(st[1].leased);
        assertEq(st[1].price, DEFAULT);
        assertTrue(st[1].defaults);
        assertEq(st[2].price, 0.02 ether);
        assertFalse(st[2].defaults);
        assertTrue(st[4].closed);
    }

    function test_RevertWhen_StatusBatchOutOfRange() public {
        vm.expectRevert(Dybbo.TokenOutOfRange.selector);
        dybbo.statusBatch(0, 4);
        vm.expectRevert(Dybbo.TokenOutOfRange.selector);
        dybbo.statusBatch(4, 2);
    }
}
