// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract STokenManagerProxy is ERC1967Proxy {
	constructor(address _logic, bytes memory _data) ERC1967Proxy(_logic, _data) {}

    function implementation() external view returns (address impl) {
        return _implementation();
    }

    function upgradeTo(address newImplementation) external {
		_upgradeTo(newImplementation);
    }
}
