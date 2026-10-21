// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {Dybbo, IChog} from "../src/Dybbo.sol";

interface IChogFull {
    function ownerOf(uint256) external view returns (address);
    function transferFrom(address, address, uint256) external;
    function isApprovedForAll(address, address) external view returns (bool);
    function getApproved(uint256) external view returns (address);
}

/// Runs against the real Chog Genesis on a fork of Monad mainnet (latest block; full nodes do not serve
/// old state). Holders are impersonated; nothing touches the real chain.
contract ForkTest is Test {
    IChogFull constant CHOG = IChogFull(0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763);
    Dybbo dybbo;
    address possessor = makeAddr("possessor");
    address buyer = makeAddr("buyer");

    function setUp() public {
        vm.createSelectFork("monad");
        dybbo = new Dybbo(IChog(address(CHOG)), 0.01 ether, 0.001 ether, 1 ether);
        vm.deal(possessor, 10 ether);
    }

    /// The first token after `from` whose holder is a wallet without code, so it is open by default.
    function _openToken(uint256 from) internal view returns (uint256 id, address holder) {
        for (id = from; id <= 1969; ++id) {
            holder = CHOG.ownerOf(id);
            if (holder.code.length == 0) return (id, holder);
        }
        revert("no open token");
    }

    function test_ForkAgainstMainnetChog() public {
        (uint256 src, address holder) = _openToken(1);
        (uint256 target,) = _openToken(src + 1);

        // Possess a real Chog and haunt another real one.
        vm.prank(possessor);
        dybbo.possess{value: 0.05 ether}(src, 5);
        vm.prank(possessor);
        dybbo.haunt(src, target, 0);
        assertEq(dybbo.marksOf(target).length, 1);

        // Try to take it: the real Chog Genesis refuses the possessor.
        vm.prank(possessor);
        vm.expectRevert();
        CHOG.transferFrom(holder, possessor, src);
        assertEq(CHOG.ownerOf(src), holder);
        assertFalse(CHOG.isApprovedForAll(holder, address(dybbo)));
        assertTrue(CHOG.getApproved(src) != address(dybbo));

        // The holder sells mid-lease: control ends in that block.
        vm.prank(holder);
        CHOG.transferFrom(holder, buyer, src);
        vm.warp(block.timestamp + 20);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.OwnerChanged.selector);
        dybbo.haunt(src, target + 1 <= 1969 ? target + 1 : 1, 0);

        // The fee follows the token to the buyer.
        vm.prank(holder);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.claim(src);
        vm.prank(buyer);
        dybbo.claim(src);
        assertEq(buyer.balance, 0.05 ether);
    }

    function test_ForkContractHoldersStartClosed() public view {
        Dybbo.Status[] memory st = dybbo.statusBatch(1, 200);
        for (uint256 i; i < st.length; ++i) {
            bool holderHasCode = CHOG.ownerOf(i + 1).code.length > 0;
            assertEq(st[i].closed, holderHasCode);
        }
    }

    function test_ForkStatusBatchCoversTheCollection() public view {
        uint256 g = gasleft();
        Dybbo.Status[] memory st = dybbo.statusBatch(1, 1969);
        uint256 used = g - gasleft();
        assertEq(st.length, 1969);
        // Must fit the public RPC's eth_call cap of 200M gas with room to spare.
        assertLt(used, 100_000_000);
    }
}
