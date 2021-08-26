// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {IAddressConfig} from "@devprotocol/protocol/contracts/interface/IAddressConfig.sol";
import {STokensDescriptor} from "./STokensDescriptor.sol";

contract STokensManager is
	ISTokensManager,
	STokensDescriptor,
	ERC721Upgradeable
{
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	address public config;
	mapping(bytes32 => bytes) private bytesStorage;

	modifier onlyLockup() {
		require(
			IAddressConfig(config).lockup() == _msgSender(),
			"illegal access"
		);
		_;
	}

	function initialize(address _config) external override initializer {
		__ERC721_init("Dev Protocol sTokens V1", "DEV-STOKENS-V1");
		config = _config;
	}

	function tokenURI(uint256 _tokenId)
		public
		view
		override
		returns (string memory)
	{
		require(_exists(_tokenId), "not found");
		return getTokenURI(getStoragePositionV1(_tokenId));
	}

	function mint(MintParams calldata _params)
		external
		override
		onlyLockup
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
		override
		onlyLockup
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
		private
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
