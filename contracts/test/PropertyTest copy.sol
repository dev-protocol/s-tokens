// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import "../interface/IProperty.sol";

contract PropertyTest is IProperty {
	address public override author;

	constructor(address _own) {
		author = _own;
	}
}
