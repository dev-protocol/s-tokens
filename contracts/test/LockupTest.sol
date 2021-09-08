// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract LockupTest {
	address private sTokenManager;
	uint256 public latestTokenId;
	mapping(uint256 => uint256) public setValueMap;

	constructor(address _sTokenManager) {
		sTokenManager = _sTokenManager;
	}

	function calculateWithdrawableInterestAmountByPosition(uint256 _tokenId)
		external
		view
		returns (uint256)
	{
		return setValueMap[_tokenId];
	}

	function setCalculateWithdrawableInterestAmountByPosition(
		uint256 _tokenId,
		uint256 _value
	) external {
		setValueMap[_tokenId] = _value;
	}

	function executeMint(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price
	) external {
		latestTokenId = ISTokensManager(sTokenManager).mint(
			_owner,
			_property,
			_amount,
			_price
		);
	}

	function executeUpdate(
		uint256 _tikenId,
		uint256 _amount,
		uint256 _price,
		uint256 _cumulativeReward,
		uint256 _pendingReward
	) external {
		ISTokensManager(sTokenManager).update(
			_tikenId,
			_amount,
			_price,
			_cumulativeReward,
			_pendingReward
		);
	}
}