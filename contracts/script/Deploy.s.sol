// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {Dybbo, IChog} from "../src/Dybbo.sol";

/// Deploys Dybbo against Chog Genesis on Monad mainnet. Prices are fixed at deploy (no admin can change
/// them later); they default to PRD §8.2 and can be set with DEFAULT_PRICE_WEI, MIN_PRICE_WEI, MAX_PRICE_WEI.
contract Deploy is Script {
    address constant CHOG_GENESIS = 0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763;

    function run() external returns (Dybbo dybbo) {
        require(block.chainid == 143, "Dybbo deploys to Monad mainnet only (chainId 143)");
        uint256 defaultPrice = vm.envOr("DEFAULT_PRICE_WEI", uint256(0.01 ether));
        uint256 minPrice = vm.envOr("MIN_PRICE_WEI", uint256(0.001 ether));
        uint256 maxPrice = vm.envOr("MAX_PRICE_WEI", uint256(1 ether));

        vm.startBroadcast();
        dybbo = new Dybbo(IChog(CHOG_GENESIS), defaultPrice, minPrice, maxPrice);
        vm.stopBroadcast();

        console.log("Dybbo deployed at", address(dybbo));
        console.log("default / min / max price (wei):", defaultPrice, minPrice, maxPrice);
    }
}
