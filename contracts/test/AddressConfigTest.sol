// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

contract AddressConfigTest {
	address public lockup;

	function setLockup(address _addr) external {
		lockup = _addr;
	}
}
