// SPDX-License-Identifier: Apache-2.0

// OpenZeppelin Contracts v4.4.1 (proxy/ERC1967/ERC1967Proxy.sol)

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "hardhat-deploy/solc_0.8/openzeppelin/proxy/Proxy.sol";
import "hardhat-deploy/solc_0.8/openzeppelin/proxy/ERC1967/ERC1967Upgrade.sol";

/**
 * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
 * implementation address that can be changed. This address is stored in storage in the location specified by
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967], so that it doesn't conflict with the storage layout of the
 * implementation behind the proxy.
 */
contract ERC1967Proxy is Proxy, ERC1967Upgrade {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
     */
    constructor(address _logic, bytes memory _data) payable {
        console.log("In ERC1967Proxy constuctor");
        console.log("In ERC1967Proxy constuctor _logic: ");
        console.logAddress(_logic);
        console.log("In ERC1967Proxy constuctor _data: ");
        console.logBytes(_data);
        assert(
            _IMPLEMENTATION_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
        );
        _upgradeToAndCall(_logic, _data, false);
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation()
        internal
        view
        virtual
        override
        returns (address impl)
    {
        console.log("In ERC1967Proxy _implementation");
        return ERC1967Upgrade._getImplementation();
    }
}
