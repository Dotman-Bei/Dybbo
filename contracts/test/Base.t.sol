// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {Dybbo, IChog} from "../src/Dybbo.sol";
import {MockChog} from "./mocks/MockChog.sol";

/// A wallet with code, standing in for a vault or marketplace that holds Chogs.
contract Vault {
    function setTerms(Dybbo d, uint256 id, uint96 price, bool closed) external {
        d.setTerms(id, price, closed);
    }
}

abstract contract Base is Test {
    uint256 internal constant DEFAULT = 0.01 ether;
    uint256 internal constant MIN = 0.001 ether;
    uint256 internal constant MAX = 1 ether;

    MockChog internal chog;
    Dybbo internal dybbo;

    address internal holder = makeAddr("holder");
    address internal holder2 = makeAddr("holder2");
    address internal possessor = makeAddr("possessor");
    address internal stranger = makeAddr("stranger");
    address internal buyer = makeAddr("buyer");

    function setUp() public virtual {
        vm.warp(1_760_000_000);
        chog = new MockChog();
        dybbo = new Dybbo(IChog(address(chog)), DEFAULT, MIN, MAX);
        chog.mint(holder, 1);
        chog.mint(holder, 2);
        chog.mint(holder2, 3);
        chog.mint(holder2, 4);
        vm.deal(possessor, 100 ether);
        vm.deal(stranger, 100 ether);
    }

    function _possess(address who, uint256 id, uint8 mins) internal {
        vm.prank(who);
        dybbo.possess{value: DEFAULT * mins}(id, mins);
    }
}
