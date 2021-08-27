// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract LockupTest {
	address private sTokenManager;
	uint256 public latestTokenId;
	ISTokensManager.StakingPosition public latestPositions;

	constructor(address _sTokenManager) {
		sTokenManager = _sTokenManager;
	}

	function executeMint(ISTokensManager.MintParams calldata _params) external {
		(latestTokenId, latestPositions) = ISTokensManager(sTokenManager).mint(
			_params
		);
	}

	function executeUpdate(ISTokensManager.UpdateParams calldata _params)
		external
	{
		latestPositions = ISTokensManager(sTokenManager).update(_params);
	}
}
