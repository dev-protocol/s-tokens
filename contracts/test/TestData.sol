// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract TestData {
	function getStakingPosition(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price,
		uint256 _historical
	) external pure returns (ISTokensManager.StakingPosition memory) {
		return
			ISTokensManager.StakingPosition(
				_owner,
				_property,
				_amount,
				_price,
				_historical
			);
	}

	function getMintParams(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price
	) external pure returns (ISTokensManager.MintParams memory) {
		return
			ISTokensManager.MintParams(
				_owner,
				_property,
				_amount,
				_price
			);
	}

	function getUpdateParams(
		uint256 _tokenId,
		uint256 _amount,
		uint256 _price,
		uint256 _historical
	) external pure returns (ISTokensManager.UpdateParams memory) {
		return
			ISTokensManager.UpdateParams(
				_tokenId,
				_amount,
				_price,
				_historical
			);
	}
}
