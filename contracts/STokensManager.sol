// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {IAddressConfig} from "@devprotocol/protocol/contracts/interface/IAddressConfig.sol";
import {STokensDescriptor} from "./STokensDescriptor.sol";
import {IStakingPosition} from "./IStakingPosition.sol";

contract STokensManager is
	IStakingPosition,
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
		return getTokenURI(getStoragePositionsV1(_tokenId));
	}

	function mint(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price
	) external override onlyLockup returns (uint256 tikenId_) {
		_tokenIds.increment();
		uint256 newTokenId = _tokenIds.current();
		_safeMint(_owner, newTokenId);
		emit Minted(newTokenId, _owner, _property, _amount, _price);
		StakingPosition memory newPosition = StakingPosition(
			_property,
			_amount,
			_price,
			0,
			0
		);
		setStoragePositionsV1(newTokenId, newPosition);
		return newTokenId;
	}

	function update(
		uint256 _tikenId,
		uint256 _amount,
		uint256 _price,
		uint256 _cumulativeReward,
		uint256 _pendingReward
	) external override onlyLockup returns (bool) {
		require(_exists(_tikenId), "not found");
		StakingPosition memory currentPosition = getStoragePositionsV1(
			_tikenId
		);
		currentPosition.amount = _amount;
		currentPosition.price = _price;
		currentPosition.cumulativeReward = _cumulativeReward;
		currentPosition.pendingReward = _pendingReward;
		setStoragePositionsV1(_tikenId, currentPosition);
		emit Updated(
			_tikenId,
			_amount,
			_price,
			_cumulativeReward,
			_pendingReward
		);
		return true;
	}

	function positions(uint256 _tokenId)
		external
		view
		override
		returns (
			address property_,
			uint256 amount_,
			uint256 price_,
			uint256 cumulativeReward_,
			uint256 pendingReward_
		)
	{
		StakingPosition memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		return (
			currentPosition.property,
			currentPosition.amount,
			currentPosition.price,
			currentPosition.cumulativeReward,
			currentPosition.pendingReward
		);
	}

	function getStoragePositionsV1(uint256 _tokenId)
		private
		view
		returns (StakingPosition memory)
	{
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		require(keccak256(tmp) != keccak256(bytes("")), "illegal token id");
		return abi.decode(tmp, (StakingPosition));
	}

	function setStoragePositionsV1(
		uint256 _tokenId,
		StakingPosition memory _position
	) private {
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
