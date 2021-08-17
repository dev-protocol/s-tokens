// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {UsingStorageSimple} from "@devprotocol/util-contracts/contracts/storage/UsingStorageSimple.sol";

contract STokensManagerStorage is UsingStorageSimple {
	function getStoragePositionsV1(uint256 _tokenId) public view returns(ISTokensManager.StakingPosition memory) {
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		string memory tmp = eternalStorage().getString(key);
		if (keccak256(abi.encodePacked(tmp)) == keccak256(abi.encodePacked(""))) {
			return ISTokensManager.StakingPosition(address(0), address(0), 0, 0, 0);
		}
		return abi.decode(bytes(tmp), (ISTokensManager.StakingPosition));
	}

	function setStoragePositionsV1(uint256 _tokenId, ISTokensManager.StakingPosition memory _position) internal {
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = abi.encode(_position);
		string memory converted = string(tmp);
		eternalStorage().setString(key, converted);
	}

	function getStoragePositionsV1Key(uint256 _tokenId) private pure returns(bytes32) {
		return keccak256(abi.encodePacked("_positionsV1", _tokenId));
	}
}
