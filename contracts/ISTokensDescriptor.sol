// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

interface ISTokensDescriptor {
	function getTokenURI(ISTokensManager.StakingPosition memory _position)
		external
		pure
		returns (string memory);
}
