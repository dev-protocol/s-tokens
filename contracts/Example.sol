// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.3;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Example {
	using SafeMath for uint256;
	uint256 public value = 0;

	function add(uint256 v) external {
		value = value.add(v);
	}
}
