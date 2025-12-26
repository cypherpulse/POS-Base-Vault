// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {POSVault} from "../src/POSVault.sol";

contract DeployPOSVault is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy with treasury = deployer (msg.sender)
        POSVault vault = new POSVault(msg.sender);

        vm.stopBroadcast();

        console.log("POSVault deployed at:", address(vault));
    }
}