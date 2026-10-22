// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Base, Vault} from "./Base.t.sol";
import {Dybbo} from "../src/Dybbo.sol";

contract LeaseTest is Base {
    function test_PossessRecordsLeaseAndEscrow() public {
        _possess(possessor, 1, 5);
        (address p, uint40 until, address atStart, bool active, uint40 start, uint96 fee) = dybbo.leaseOf(1);
        assertEq(p, possessor);
        assertEq(until, block.timestamp + 300);
        assertEq(atStart, holder);
        assertTrue(active);
        assertEq(start, block.timestamp);
        assertEq(fee, 0.05 ether);
        assertEq(dybbo.escrowOf(1), 0.05 ether);
        assertEq(address(dybbo).balance, 0.05 ether);
    }

    function test_PossessEmitsPossessed() public {
        vm.expectEmit(address(dybbo));
        emit Dybbo.Possessed(1, possessor, holder, block.timestamp + 60, 0.01 ether);
        _possess(possessor, 1, 1);
    }

    function test_RevertWhen_TokenOutOfRange() public {
        vm.prank(possessor);
        vm.expectRevert(Dybbo.TokenOutOfRange.selector);
        dybbo.possess{value: DEFAULT}(0, 1);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.TokenOutOfRange.selector);
        dybbo.possess{value: DEFAULT}(1970, 1);
    }

    function test_RevertWhen_WrongPayment() public {
        vm.prank(possessor);
        vm.expectRevert(Dybbo.WrongPayment.selector);
        dybbo.possess{value: DEFAULT * 5 - 1}(1, 5);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.WrongPayment.selector);
        dybbo.possess{value: DEFAULT * 5 + 1}(1, 5);
    }

    function test_RevertWhen_DurationOutOfRange() public {
        vm.prank(possessor);
        vm.expectRevert(Dybbo.DurationOutOfRange.selector);
        dybbo.possess{value: 0}(1, 0);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.DurationOutOfRange.selector);
        dybbo.possess{value: DEFAULT * 11}(1, 11);
    }

    function test_RevertWhen_SelfDybbo() public {
        vm.deal(holder, 1 ether);
        vm.prank(holder);
        vm.expectRevert(Dybbo.SelfDybbo.selector);
        dybbo.possess{value: DEFAULT}(1, 1);
    }

    function test_RevertWhen_LeaseActive() public {
        _possess(possessor, 1, 5);
        vm.prank(stranger);
        vm.expectRevert(Dybbo.LeaseActive.selector);
        dybbo.possess{value: DEFAULT}(1, 1);
    }

    function test_NewLeaseAfterExpiry() public {
        _possess(possessor, 1, 1);
        vm.warp(block.timestamp + 60);
        _possess(stranger, 1, 2);
        (address p,,,,,) = dybbo.leaseOf(1);
        assertEq(p, stranger);
        assertEq(dybbo.escrowOf(1), 0.03 ether);
    }

    function test_NewLeaseAfterSaleVoidsTheOld() public {
        _possess(possessor, 1, 10);
        vm.prank(holder);
        chog.transferFrom(holder, buyer, 1);
        (,,, bool active,,) = dybbo.leaseOf(1);
        assertFalse(active);
        _possess(stranger, 1, 1);
        (address p,, address atStart,,,) = dybbo.leaseOf(1);
        assertEq(p, stranger);
        assertEq(atStart, buyer);
    }

    function test_OnePossessorManyChogs() public {
        _possess(possessor, 1, 1);
        _possess(possessor, 3, 1);
        (,,, bool a1,,) = dybbo.leaseOf(1);
        (,,, bool a3,,) = dybbo.leaseOf(3);
        assertTrue(a1 && a3);
    }

    // ------------------------------------------------------------ terms

    function test_HolderSetsPrice() public {
        vm.prank(holder);
        dybbo.setTerms(1, 0.05 ether, false);
        (uint96 price, bool closed, bool defaults,) = dybbo.termsOf(1);
        assertEq(price, 0.05 ether);
        assertFalse(closed);
        assertFalse(defaults);
        vm.prank(possessor);
        dybbo.possess{value: 0.1 ether}(1, 2);
        assertEq(dybbo.escrowOf(1), 0.1 ether);
    }

    function test_RevertWhen_ClosedByHolder() public {
        vm.prank(holder);
        dybbo.setTerms(1, uint96(DEFAULT), true);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Closed.selector);
        dybbo.possess{value: DEFAULT}(1, 1);
    }

    function test_RevertWhen_NonHolderSetsTerms() public {
        vm.prank(stranger);
        vm.expectRevert(Dybbo.NotOwner.selector);
        dybbo.setTerms(1, uint96(DEFAULT), true);
    }

    function test_RevertWhen_PriceOutOfRange() public {
        vm.startPrank(holder);
        vm.expectRevert(Dybbo.PriceOutOfRange.selector);
        dybbo.setTerms(1, uint96(MIN - 1), false);
        vm.expectRevert(Dybbo.PriceOutOfRange.selector);
        dybbo.setTerms(1, uint96(MAX + 1), false);
        vm.stopPrank();
    }

    function test_TermsResetForBuyer() public {
        vm.prank(holder);
        dybbo.setTerms(1, 0.5 ether, true);
        vm.prank(holder);
        chog.transferFrom(holder, buyer, 1);
        (uint96 price, bool closed, bool defaults,) = dybbo.termsOf(1);
        assertEq(price, DEFAULT);
        assertFalse(closed);
        assertTrue(defaults);
    }

    function test_ClosingLetsTheActiveLeaseRunOut() public {
        _possess(possessor, 1, 5);
        vm.prank(holder);
        dybbo.setTerms(1, uint96(DEFAULT), true);
        (,,, bool active,,) = dybbo.leaseOf(1);
        assertTrue(active);
    }

    function test_ContractHolderClosedByDefault() public {
        Vault vault = new Vault();
        chog.mint(address(vault), 5);
        (, bool closed, bool defaults, bool isContract) = dybbo.termsOf(5);
        assertTrue(closed && defaults && isContract);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.Closed.selector);
        dybbo.possess{value: DEFAULT}(5, 1);

        vault.setTerms(dybbo, 5, uint96(DEFAULT), false);
        (, closed, defaults,) = dybbo.termsOf(5);
        assertFalse(closed || defaults);
        _possess(possessor, 5, 1);
    }

    // ------------------------------------------------------------ EIP-7702 wallets

    function test_SevenSevenZeroTwoWalletOpenByDefault() public {
        address smart = makeAddr("smart");
        vm.etch(smart, abi.encodePacked(hex"ef0100", makeAddr("delegator")));
        chog.mint(smart, 6);
        (, bool closed, bool defaults, bool isContract) = dybbo.termsOf(6);
        assertFalse(closed);
        assertTrue(defaults);
        assertFalse(isContract);
        _possess(possessor, 6, 1);
    }

    function test_TwentyThreeByteContractStillCountsAsContract() public {
        address odd = makeAddr("odd");
        // Same length as a delegation designator, but ordinary contract code: it stays closed.
        // (Code starting with 0xef can only be a valid designator, per EIP-3541 and EIP-7702.)
        vm.etch(odd, abi.encodePacked(bytes23(hex"5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b00")));
        chog.mint(odd, 7);
        (, bool closed,, bool isContract) = dybbo.termsOf(7);
        assertTrue(closed && isContract);
    }

    function testFuzz_PaymentMustBeExact(uint8 mins, uint256 value) public {
        mins = uint8(bound(mins, 1, 10));
        value = bound(value, 0, 10 ether);
        vm.assume(value != DEFAULT * mins);
        vm.prank(possessor);
        vm.expectRevert(Dybbo.WrongPayment.selector);
        dybbo.possess{value: value}(1, mins);
    }
}
