// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import "../interface/ITokenURIDescriptor.sol";

contract TokenURIDescriptorTest is ITokenURIDescriptor {
	mapping(uint256 => bytes32) public _dataOf;
	bool public shouldBe = true;

	function image(
		uint256,
		address,
		ISTokenManagerStruct.StakingPositionV1 memory,
		ISTokenManagerStruct.RewardsV1 memory,
		bytes32
	) external pure override returns (string memory) {
		return "dummy-string";
	}

	function onBeforeMint(
		uint256 _tokenId,
		address,
		ISTokenManagerStruct.StakingPositionV1 memory,
		bytes32 _payload
	) external override returns (bool) {
		_dataOf[_tokenId] = _payload;
		return shouldBe;
	}

	function dataOf(uint256 _tokenId) external view returns (bytes32) {
		return _dataOf[_tokenId];
	}

	function __shouldBe(bool _bool) public {
		shouldBe = _bool;
	}
}
