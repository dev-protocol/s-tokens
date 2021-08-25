// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.4;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract STokensManagerProxy is ERC1967Proxy, Ownable {
	constructor(address _logic, bytes memory _data)
		ERC1967Proxy(_logic, _data)
	{}

	function implementation() external view returns (address impl) {
		return _implementation();
	}

	function upgradeTo(address newImplementation) external onlyOwner {
		_upgradeTo(newImplementation);
	}
}
