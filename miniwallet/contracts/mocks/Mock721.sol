// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Mock721 is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        console.log("In Mock721 constructor");
        _disableInitializers();
    }

    function initialize() public initializer {
        // console.log("In Mock721 initialize");
        // address owner = msg.sender;
        // // solhint-disable-next-line security/no-inline-assembly
        // assembly {
        //     sstore(
        //         0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103,
        //         owner
        //     )
        // }
        __ERC721_init("Mock721", "MOK");
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://mock.modulo.so/";
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        console.log("In Mock721 _authorizeUpgrade");
    }
}
