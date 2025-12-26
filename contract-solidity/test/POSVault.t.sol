// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {POSVault} from "../src/POSVault.sol";

contract POSVaultTest is Test {
    POSVault vault;
    address owner = address(1);
    address treasury = address(2);
    address merchant = address(3);
    address customer = address(4);
    address unauthorized = address(5);

    function setUp() public {
        vm.prank(owner);
        vault = new POSVault(treasury);
    }

    function testDepositSuccess() public {
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 0.01 ether}();
        assertEq(vault.getBalance(), 0.01 ether);
    }

    function testDepositBelowMin() public {
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vm.expectRevert(POSVault.BelowMinDeposit.selector);
        vault.deposit{value: 0.0005 ether}();
    }

    function testWithdrawByMerchant() public {
        // Add merchant
        vm.prank(owner);
        vault.addMerchant(merchant);

        // Deposit
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();

        // Withdraw
        vm.prank(merchant);
        vault.withdraw(1 ether);

        // Check balances
        assertEq(vault.getBalance(), 0);
        assertEq(treasury.balance, 0.005 ether); // 0.5% fee
        assertEq(merchant.balance, 0.995 ether); // 99.5%
    }

    function testWithdrawByOwner() public {
        // Deposit
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();

        // Withdraw by owner
        vm.prank(owner);
        vault.withdraw(1 ether);

        // Check balances
        assertEq(vault.getBalance(), 0);
        assertEq(treasury.balance, 0.005 ether);
        assertEq(owner.balance, 0.995 ether);
    }

    function testWithdrawUnauthorized() public {
        // Deposit
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();

        // Try withdraw unauthorized
        vm.prank(unauthorized);
        vm.expectRevert(POSVault.NotAuthorized.selector);
        vault.withdraw(1 ether);
    }

    function testWithdrawInsufficientBalance() public {
        // Add merchant
        vm.prank(owner);
        vault.addMerchant(merchant);

        // Deposit small amount
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 0.01 ether}();

        // Try withdraw more
        vm.prank(merchant);
        vm.expectRevert(POSVault.InsufficientBalance.selector);
        vault.withdraw(1 ether);
    }

    function testWithdrawFeeTransferFailed() public {
        // Add merchant
        vm.prank(owner);
        vault.addMerchant(merchant);

        // Deposit
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();

        // Mock treasury to fail
        vm.mockCallRevert(treasury, bytes(""), "mock revert");

        vm.prank(merchant);
        vm.expectRevert(POSVault.FeeTransferFailed.selector);
        vault.withdraw(1 ether);
    }

    function testWithdrawTransferFailed() public {
        // Add merchant
        vm.prank(owner);
        vault.addMerchant(merchant);

        // Deposit
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();

        // Mock merchant to fail
        vm.mockCallRevert(merchant, bytes(""), "mock revert");

        vm.prank(merchant);
        vm.expectRevert(POSVault.WithdrawTransferFailed.selector);
        vault.withdraw(1 ether);
    }

    function testAddMerchant() public {
        vm.prank(owner);
        vault.addMerchant(merchant);
        assertTrue(vault.isMerchant(merchant));
    }

    function testAddMerchantZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(POSVault.ZeroAddress.selector);
        vault.addMerchant(address(0));
    }

    function testAddMerchantAlreadyMerchant() public {
        vm.prank(owner);
        vault.addMerchant(merchant);
        vm.prank(owner);
        vm.expectRevert(POSVault.AlreadyMerchant.selector);
        vault.addMerchant(merchant);
    }

    function testRemoveMerchant() public {
        vm.prank(owner);
        vault.addMerchant(merchant);
        vm.prank(owner);
        vault.removeMerchant(merchant);
        assertFalse(vault.isMerchant(merchant));
    }

    function testRemoveMerchantNotMerchant() public {
        vm.prank(owner);
        vm.expectRevert(POSVault.NotMerchant.selector);
        vault.removeMerchant(merchant);
    }

    function testPause() public {
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused());
    }

    function testUnpause() public {
        vm.prank(owner);
        vault.pause();
        vm.prank(owner);
        vault.unpause();
        assertFalse(vault.paused());
    }

    function testDepositWhenPaused() public {
        vm.prank(owner);
        vault.pause();
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vault.deposit{value: 0.01 ether}();
    }

    function testWithdrawWhenPaused() public {
        vm.prank(owner);
        vault.addMerchant(merchant);
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();
        vm.prank(owner);
        vault.pause();
        vm.prank(merchant);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vault.withdraw(1 ether);
    }

    function testEmergencyWithdraw() public {
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();
        vm.prank(owner);
        vault.emergencyWithdraw(owner, 1 ether);
        assertEq(owner.balance, 1 ether);
        assertEq(vault.getBalance(), 0);
    }

    function testEmergencyWithdrawTransferFailed() public {
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 1 ether}();
        vm.mockCallRevert(owner, bytes(""), "mock revert");
        vm.prank(owner);
        vm.expectRevert(POSVault.TransferFailed.selector);
        vault.emergencyWithdraw(owner, 1 ether);
    }

    function testGetBalance() public {
        vm.prank(customer);
        vm.deal(customer, 1 ether);
        vault.deposit{value: 0.01 ether}();
        assertEq(vault.getBalance(), 0.01 ether);
    }

    function testConstructorZeroTreasury() public {
        vm.expectRevert(POSVault.ZeroAddress.selector);
        new POSVault(address(0));
    }
}