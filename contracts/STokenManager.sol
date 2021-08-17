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

	// TODO この名前でいいか確認する
	constructor() ERC721("SDev", "SDEV") {}

	function tokenURI(uint256 _tokenId) public view override returns (string memory){
		require(_exists(_tokenId), "not found");
		return getTokenURI(getStoragePositionsV1(_tokenId));
	}

	function mint(MintParams calldata _params)
		external override
		returns (uint256 tokenId, StakingPosition memory position){
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(_params.owner, newItemId);
		// TODO 0でいいのか後で確認する
		StakingPosition memory newPosition = StakingPosition(_params.owner, _params.property, _params.amount, _params.price, 0);
		setStoragePositionsV1(tokenId, newPosition);
		return (newItemId, newPosition);
	}

	function update(UpdateParams calldata _params)
		external override
		returns (StakingPosition memory position){
		StakingPosition memory currentPosition = getStoragePositionsV1(_params.tokenId);
		currentPosition.amount = _params.amount;
		currentPosition.price = _params.price;
		currentPosition.historical = _params.historical;
		setStoragePositionsV1(_params.tokenId, currentPosition);
		return currentPosition;
	}

	function positions(uint256 _tokenId)
		external override
		view
		returns (StakingPosition memory position) {
			return getStoragePositionsV1(_tokenId);
	}
}
