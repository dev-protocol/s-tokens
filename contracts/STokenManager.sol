// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {IAddressConfig} from "./IAddressConfig.sol";
import {STokensManagerStorage} from "./STokensManagerStorage.sol";
import {ISTokensDescriptor} from "./ISTokensDescriptor.sol";

contract STokensManager is
	ISTokensManager,
	STokensManagerStorage,
	ERC721,
	Ownable
{
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	address public config;
	address public descriptor;

	// TODO この名前でいいか確認する
	constructor(address _config) ERC721("SDev", "SDEV") {
		config = _config;
	}

	modifier onlyLockup() {
		require(
			IAddressConfig(config).lockup() == _msgSender(),
			"illegal access"
		);
		_;
	}

	function setDescriptor(address _descriptor) external onlyOwner {
		descriptor = _descriptor;
	}

	function tokenURI(uint256 _tokenId)
		public
		view
		override
		returns (string memory)
	{
		require(_exists(_tokenId), "not found");
		ISTokensDescriptor sTokensDescriptor = ISTokensDescriptor(descriptor);
		return sTokensDescriptor.getTokenURI(getStoragePositionsV1(_tokenId));
	}

	function mint(MintParams calldata _params)
		external
		onlyLockup
		override
		returns (uint256 tokenId, StakingPosition memory position)
	{
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(_params.owner, newItemId);
		// TODO 0でいいのか後で確認する
		StakingPosition memory newPosition = StakingPosition(
			_params.owner,
			_params.property,
			_params.amount,
			_params.price,
			0
		);
		setStoragePositionsV1(newItemId, newPosition);
		return (newItemId, newPosition);
	}

	function update(UpdateParams calldata _params)
		external
		onlyLockup
		override
		returns (StakingPosition memory position)
	{
		StakingPosition memory currentPosition = getStoragePositionsV1(
			_params.tokenId
		);
		currentPosition.amount = _params.amount;
		currentPosition.price = _params.price;
		currentPosition.historical = _params.historical;
		setStoragePositionsV1(_params.tokenId, currentPosition);
		return currentPosition;
	}

	function positions(uint256 _tokenId)
		external
		view
		override
		returns (StakingPosition memory position)
	{
		return getStoragePositionsV1(_tokenId);
	}
}
