// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract LockupTest {
	address private sTokenManager;
	uint256 public latestTokenId;
	ISTokensManager.StakingPosition public latestPosition;

	constructor(address _sTokenManager) {
		sTokenManager = _sTokenManager;
	}

	function executeMint(ISTokensManager.MintParams calldata _params) external {
		(latestTokenId, latestPosition) = ISTokensManager(sTokenManager).mint(
			_params
		);
	}

	function executeUpdate(ISTokensManager.UpdateParams calldata _params)
		external
	{
		latestPosition = ISTokensManager(sTokenManager).update(_params);
	}
}
