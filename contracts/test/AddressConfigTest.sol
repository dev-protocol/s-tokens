// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

contract AddressConfigTest {
	address public lockup;
	address public metricsGroup;

	function setLockup(address _addr) external {
		lockup = _addr;
	}

	function setMetricsGroup(address _addr) external {
		metricsGroup = _addr;
	}
}
