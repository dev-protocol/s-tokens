// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract TestData {
	function getStakingPosition(address _owner, address _property, uint256 _amount, uint256 _price, uint256 _historical) external pure returns(ISTokensManager.StakingPosition memory) {
		return ISTokensManager.StakingPosition(_owner, _property, _amount, _price, _historical);
	}
}

