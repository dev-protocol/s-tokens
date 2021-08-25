// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {AddressLib} from "@devprotocol/util-contracts/contracts/utils/AddressLib.sol";
import {STokensManager} from "../STokensManager.sol";

contract STokensManagerTest is STokensManager {
	using AddressLib for address;

	function dummyFunc()
		public
		view
		returns (string memory)
	{
		return config.toChecksumString();
	}
}
