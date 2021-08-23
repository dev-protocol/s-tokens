// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {IAddressConfig} from "./IAddressConfig.sol";
import {ISTokensDescriptor} from "./ISTokensDescriptor.sol";

contract STokensManager is
	ISTokensManager,
	ERC721,
	Ownable
{
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	address public config;
	address public descriptor;
	mapping(bytes32 => bytes) private bytesStorage;

	// TODO この名前でいいか確認する
	constructor(address _config) ERC721("Dev Protocol sTokens V1", "DEV-STOKENS-V1") {
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
		return sTokensDescriptor.getTokenURI(getStoragePositionV1(_tokenId));
	}

	function mint(MintParams calldata _params)
		external
		onlyLockup
		override
		returns (uint256, StakingPosition memory)
	{
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(_params.owner, newItemId);
		StakingPosition memory newPosition = StakingPosition(
			_params.owner,
			_params.property,
			_params.amount,
			_params.price,
			// TODO ここ0でいいか確認
			0,
			// TODO ここ0でいいか確認
			0
		);
		setStoragePositionV1(newItemId, newPosition);
		return (newItemId, newPosition);
	}

	function update(UpdateParams calldata _params)
		external
		onlyLockup
		override
		returns (StakingPosition memory)
	{
		require(_exists(_params.tokenId), "not found");
		StakingPosition memory currentPosition = getStoragePositionV1(
			_params.tokenId
		);
		currentPosition.amount = _params.amount;
		currentPosition.price = _params.price;
		currentPosition.cumulativeReward = _params.cumulativeReward;
		currentPosition.pendingReward = _params.pendingReward;
		setStoragePositionV1(_params.tokenId, currentPosition);
		return currentPosition;
	}

	function position(uint256 _tokenId)
		external
		view
		override
		returns (StakingPosition memory)
	{
		return getStoragePositionV1(_tokenId);
	}

	function getStoragePositionV1(uint256 _tokenId)
		public
		view
		returns (StakingPosition memory)
	{
		bytes32 key = getStoragePositionV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		require(keccak256(tmp) != keccak256(bytes("")), "illegal token id");
		return abi.decode(tmp, (StakingPosition));
	}

	function setStoragePositionV1(
		uint256 _tokenId,
		StakingPosition memory _position
	) private {
		bytes32 key = getStoragePositionV1Key(_tokenId);
		bytes memory tmp = abi.encode(_position);
		bytesStorage[key] = tmp;
	}

	function getStoragePositionV1Key(uint256 _tokenId)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_positionsV1", _tokenId));
	}
}
