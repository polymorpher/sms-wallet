// SPDX-License-Identifier: Apache-2.0

// Creator: Chiru Labs
// Sep 1st 2022, Modification for MiniWallet by John Whitton

pragma solidity ^0.8.4;

import "../ERC721M.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title ERC721M Burnable Token
 * @dev ERC721M Token that can be irreversibly burned (destroyed).
 */
abstract contract ERC721MBurnable is Context, ERC721M {
    /**
     * @dev Burns `tokenId`. See {ERC721M-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burn(uint256 tokenId) public virtual {
        TokenOwnership memory prevOwnership = ownershipOf(tokenId);

        bool isApprovedOrOwner = (_msgSender() == prevOwnership.addr ||
            isApprovedForAll(prevOwnership.addr, _msgSender()) ||
            getApproved(tokenId) == _msgSender());

        if (!isApprovedOrOwner) revert TransferCallerNotOwnerNorApproved();

        _burn(tokenId);
    }
}
