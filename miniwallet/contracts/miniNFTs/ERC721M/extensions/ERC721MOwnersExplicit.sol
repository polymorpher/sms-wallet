// SPDX-License-Identifier: Apache-2.0

// Creator: Chiru Labs
// Sep 1st 2022, Modification for MiniWallet by John Whitton

pragma solidity ^0.8.4;

import "../ERC721M.sol";

error AllOwnershipsHaveBeenSet();
error QuantityMustBeNonZero();
error NoTokensMintedYet();

abstract contract ERC721MOwnersExplicit is ERC721M {
    uint256 public nextOwnerToExplicitlySet;

    /**
     * @dev Explicitly set `owners` to eliminate loops in future calls of ownerOf().
     */
    function _setOwnersExplicit(uint256 quantity) internal {
        if (quantity == 0) revert QuantityMustBeNonZero();
        if (_currentIndex == 0) revert NoTokensMintedYet();
        uint256 _nextOwnerToExplicitlySet = nextOwnerToExplicitlySet;
        if (_nextOwnerToExplicitlySet >= _currentIndex)
            revert AllOwnershipsHaveBeenSet();

        // Index underflow is impossible.
        // Counter or index overflow is incredibly unrealistic.
        unchecked {
            uint256 endIndex = _nextOwnerToExplicitlySet + quantity - 1;

            // Set the end index to be the last token index
            if (endIndex + 1 > _currentIndex) {
                endIndex = _currentIndex - 1;
            }

            for (uint256 i = _nextOwnerToExplicitlySet; i <= endIndex; i++) {
                if (
                    _ownerships[i].addr == address(0) && !_ownerships[i].burned
                ) {
                    TokenOwnership memory ownership = ownershipOf(i);
                    _ownerships[i].addr = ownership.addr;
                    _ownerships[i].startTimestamp = ownership.startTimestamp;
                }
            }

            nextOwnerToExplicitlySet = endIndex + 1;
        }
    }
}
