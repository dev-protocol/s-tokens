// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";

contract STokensManagerStorage {
	mapping(bytes32 => bytes) private bytesStorage;

	function getStoragePositionsV1(uint256 _tokenId)
		public
		view
		returns (ISTokensManager.StakingPosition memory)
	{
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		if (
			keccak256(tmp) == keccak256(bytes(""))
		) {
			return
				ISTokensManager.StakingPosition(
					address(0),
					address(0),
					0,
					0,
					0
				);
		}
		return abi.decode(tmp, (ISTokensManager.StakingPosition));
	}

	function setStoragePositionsV1(
		uint256 _tokenId,
		ISTokensManager.StakingPosition memory _position
	) internal {
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = abi.encode(_position);
		bytesStorage[key] = tmp;
	}

	function getStoragePositionsV1Key(uint256 _tokenId)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_positionsV1", _tokenId));
	}
}
