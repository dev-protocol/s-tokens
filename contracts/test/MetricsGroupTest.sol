// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

contract MetricsGroupTest {
	mapping(address => bool) public resultOf;

	function setResult(address _property) external {
		resultOf[_property] = true;
	}

	function hasAssets(address _property) external view returns (bool) {
		return resultOf[_property];
	}
}
