// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {STokensManagerStorage} from "../STokensManagerStorage.sol";

contract STokensManagerStorageTest is STokensManagerStorage {
	function setStoragePositionsV1Test(uint256 _tokenId, ISTokensManager.StakingPosition calldata _position) public {
		setStoragePositionsV1(_tokenId, _position);
	}
}
