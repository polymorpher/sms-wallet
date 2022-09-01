// SPDX-License-Identifier: Apache-2.0

// Creator: Chiru Labs
// Sep 1st 2022, Modification for MiniWallet by John Whitton

pragma solidity ^0.8.4;

import "../HRC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title HRC721 Burnable Token
 * @dev HRC721 Token that can be irreversibly burned (destroyed).
 */
abstract contract HRC721Burnable is Context, HRC721 {
    /**
     * @dev Burns `tokenId`. See {HRC721-_burn}.
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
