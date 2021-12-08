// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ISTokenManagerStruct} from "./ISTokenManagerStruct.sol";

interface ISTokenManagerDescriptor {
	/*
	 * @dev get toke uri from position information.
	 * @param _position The struct of positon information
	 */
	function getTokenURI(ISTokenManagerStruct.StakingPositionV1 memory _position)
		external
		pure
		returns (string memory);
}
