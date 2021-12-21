// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ISTokensManager} from "@devprotocol/i-s-tokens/contracts/interface/ISTokensManager.sol";
import {ISTokenManagerStruct} from "./interface/ISTokenManagerStruct.sol";
import {ISTokenManagerDescriptor} from "./interface/ISTokenManagerDescriptor.sol";
import {IAddressConfig} from "./interface/IAddressConfig.sol";
import {ILockup} from "./interface/ILockup.sol";
import {IProperty} from "./interface/IProperty.sol";

contract STokensManager is
	ISTokenManagerStruct,
	ISTokensManager,
	ERC721Upgradeable
{
	Counters.Counter private tokenIdCounter;
	address public config;
	mapping(bytes32 => bytes) private bytesStorage;
	mapping(address => uint256[]) private tokenIdsMap;
	mapping(address => EnumerableSet.UintSet) private tokenIdsMapOfOwner;
	address public descriptorAddress;

	using Counters for Counters.Counter;
	using EnumerableSet for EnumerableSet.UintSet;

	modifier onlyAuthor(uint256 _tokenId) {
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		address author = IProperty(currentPosition.property).author();
		require(author == _msgSender(), "illegal access");
		_;
	}

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

	function setDescriptor(address _descriptor) external override {
		require(descriptorAddress == address(0), "already set");
		descriptorAddress = _descriptor;
	}

	function tokenURI(uint256 _tokenId)
		public
		view
		override
		returns (string memory)
	{
		bytes32 key = getStorageDescriptorsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		if (tmp.length == 0) {
			StakingPositionV1 memory positons = getStoragePositionsV1(_tokenId);
			return
				ISTokenManagerDescriptor(descriptorAddress).getTokenURI(
					positons
				);
		}
		DescriptorsV1 memory currentDescriptor = abi.decode(
			tmp,
			(DescriptorsV1)
		);
		return currentDescriptor.descriptor;
	}

	function mint(
		address _owner,
		address _property,
		uint256 _amount,
		uint256 _price
	) external override onlyLockup returns (uint256 tokenId_) {
		tokenIdCounter.increment();
		_safeMint(_owner, tokenIdCounter.current());
		emit Minted(
			tokenIdCounter.current(),
			_owner,
			_property,
			_amount,
			_price
		);
		StakingPositionV1 memory newPosition = StakingPositionV1(
			_property,
			_amount,
			_price,
			0,
			0
		);
		setStoragePositionsV1(tokenIdCounter.current(), newPosition);
		tokenIdsMap[_property].push(tokenIdCounter.current());
		return tokenIdCounter.current();
	}

	function update(
		uint256 _tokenId,
		uint256 _amount,
		uint256 _price,
		uint256 _cumulativeReward,
		uint256 _pendingReward
	) external override onlyLockup returns (bool) {
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		currentPosition.amount = _amount;
		currentPosition.price = _price;
		currentPosition.cumulativeReward = _cumulativeReward;
		currentPosition.pendingReward = _pendingReward;
		setStoragePositionsV1(_tokenId, currentPosition);
		emit Updated(
			_tokenId,
			_amount,
			_price,
			_cumulativeReward,
			_pendingReward
		);
		return true;
	}

	function setTokenURIImage(uint256 _tokenId, string memory _data)
		external
		override
		onlyAuthor(_tokenId)
	{
		bytes32 key = getStorageDescriptorsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		DescriptorsV1 memory descriptor = DescriptorsV1(
			false,
			address(0),
			_data
		);
		emit SetTokenUri(_tokenId, _msgSender(), _data);
		if (tmp.length == 0) {
			setStorageDescriptorsV1(_tokenId, descriptor);
			return;
		}
		DescriptorsV1 memory currentDescriptor = abi.decode(
			tmp,
			(DescriptorsV1)
		);
		require(currentDescriptor.isFreezed == false, "freezed");
		setStorageDescriptorsV1(_tokenId, descriptor);
	}

	function freezeTokenURI(uint256 _tokenId)
		external
		override
		onlyAuthor(_tokenId)
	{
		DescriptorsV1 memory currentDescriptor = getStorageDescriptorsV1(
			_tokenId
		);
		require(currentDescriptor.isFreezed == false, "already freezed");
		currentDescriptor.isFreezed = true;
		currentDescriptor.freezingUser = _msgSender();
		setStorageDescriptorsV1(_tokenId, currentDescriptor);
		emit Freezed(_tokenId, _msgSender());
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
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
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

	function descriptors(uint256 _tokenId)
		external
		view
		override
		returns (
			bool,
			address,
			string memory
		)
	{
		DescriptorsV1 memory currentDescriptor = getStorageDescriptorsV1(
			_tokenId
		);
		return (
			currentDescriptor.isFreezed,
			currentDescriptor.freezingUser,
			currentDescriptor.descriptor
		);
	}

	function rewards(uint256 _tokenId)
		external
		view
		override
		returns (
			uint256 entireReward_,
			uint256 cumulativeReward_,
			uint256 withdrawableReward_
		)
	{
		address lockupAddress = IAddressConfig(config).lockup();
		uint256 withdrawableReward = ILockup(lockupAddress)
			.calculateWithdrawableInterestAmountByPosition(_tokenId);
		StakingPositionV1 memory currentPosition = getStoragePositionsV1(
			_tokenId
		);
		uint256 cumulativeReward = currentPosition.cumulativeReward;
		uint256 entireReward = cumulativeReward + withdrawableReward;

		return (entireReward, cumulativeReward, withdrawableReward);
	}

	function positionsOfProperty(address _property)
		external
		view
		override
		returns (uint256[] memory)
	{
		return tokenIdsMap[_property];
	}

	function positionsOfOwner(address _owner)
		external
		view
		override
		returns (uint256[] memory)
	{
		return tokenIdsMapOfOwner[_owner].values();
	}

	function getStoragePositionsV1(uint256 _tokenId)
		private
		view
		returns (StakingPositionV1 memory)
	{
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		return abi.decode(tmp, (StakingPositionV1));
	}

	function getStorageDescriptorsV1(uint256 _tokenId)
		private
		view
		returns (DescriptorsV1 memory)
	{
		bytes32 key = getStorageDescriptorsV1Key(_tokenId);
		bytes memory tmp = bytesStorage[key];
		return abi.decode(tmp, (DescriptorsV1));
	}

	function setStoragePositionsV1(
		uint256 _tokenId,
		StakingPositionV1 memory _position
	) private {
		bytes32 key = getStoragePositionsV1Key(_tokenId);
		bytes memory tmp = abi.encode(_position);
		bytesStorage[key] = tmp;
	}

	function setStorageDescriptorsV1(
		uint256 _tokenId,
		DescriptorsV1 memory _descriptor
	) private {
		bytes32 key = getStorageDescriptorsV1Key(_tokenId);
		bytes memory tmp = abi.encode(_descriptor);
		bytesStorage[key] = tmp;
	}

	function getStoragePositionsV1Key(uint256 _tokenId)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_positionsV1", _tokenId));
	}

	function getStorageDescriptorsV1Key(uint256 _tokenId)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_descriptorsV1", _tokenId));
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId
	) internal virtual override {
		super._beforeTokenTransfer(from, to, tokenId);

		if (from == address(0)) {
			// mint
			tokenIdsMapOfOwner[to].add(tokenId);
		} else if (to == address(0)) {
			// burn
			revert("s tokens is not burned");
		} else if (to != from) {
			tokenIdsMapOfOwner[from].remove(tokenId);
			tokenIdsMapOfOwner[to].add(tokenId);
		}
	}
}
