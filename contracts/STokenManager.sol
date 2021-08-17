// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {STokensManagerStorage} from "./STokensManagerStorage.sol";
import {STokensDescriptor} from "./STokensDescriptor.sol";

contract STokensManager is ISTokensManager, STokensManagerStorage, STokensDescriptor, ERC721 {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	function tokenURI(uint256 _tokenId) external view returns (string){
		require(_exists(tokenId), "not found");
		return getTokenURI(getStoragePositionsV1(_tokenId));
	}

	function mint(MintParams calldata _params)
		external
		returns (uint256 tokenId, StakingPosition memory position){
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(_params.owner, newItemId);
		StakingPosition position = StakingPosition(_params.owner, _params.property, _params.amount, _params.price);
		setStoragePositionsV1(tokenId, position);
		return (newItemId, position);
	}

	function update(UpdateParams calldata _params)
		external
		returns (StakingPosition memory position){
		StakingPosition position = getStoragePositionsV1(_params.tokenId);
		position.amount = _params.amount;
		position.price = _params.price;
		position.historical = _params.historical;
		setStoragePositionsV1(tokenId, position);
		return position;
	}

	function positions(uint256 _tokenId)
		external
		view
		returns (StakingPosition memory position) {
			return getStoragePositionsV1(_tokenId);
	}
}
