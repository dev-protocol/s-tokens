// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import "../interface/ITokenURIDescriptor.sol";

contract TokenURIDescriptorTest is ITokenURIDescriptor {
	function image(
		uint256,
		address,
		ISTokenManagerStruct.StakingPositionV1 memory,
		ISTokenManagerStruct.RewardsV1 memory
	) external pure override returns (string memory) {
		return "dummy-string";
	}
}
