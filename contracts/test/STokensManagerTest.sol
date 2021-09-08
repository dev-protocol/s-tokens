// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {STokensManager} from "../STokensManager.sol";

contract STokensManagerTest is STokensManager {
	function dummyFunc() public pure returns (uint256) {
		return 10;
	}
}
