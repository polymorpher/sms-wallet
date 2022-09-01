// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "./HRC721/HRC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./rarible/royalties/contracts/impl/RoyaltiesV2Impl.sol";
import "./rarible/royalties/contracts/LibPart.sol";
import "./rarible/royalties/contracts/LibRoyaltiesV2.sol";

contract Mini721 is HRC721, Ownable, RoyaltiesV2Impl {
    bytes32 internal salt;
    uint256 public maxMiniTokens;
    uint256 public mintPrice;
    uint256 public maxPerMint;
    uint256 public startIndex;

    string public provenanceHash = "";
    uint256 public offsetValue;

    bool public metadataFrozen;
    bool public provenanceFrozen;
    bool public saleIsActive;
    bool public saleStarted;

    mapping(uint256 => string) internal metadataUris;
    string internal _contractUri;
    string public temporaryTokenUri;
    string internal baseUri;
    address internal revenueAccount;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    event SetBaseUri(string baseUri);
    event SetStartIndex(uint256 index);
    event MiniMint(
        uint256 lastTokenId,
        uint256 numTokens,
        address initialOwner
    );
    event MiniMintCommunity(
        uint256 lastTokenId,
        uint256 numTokens,
        address initialOwner
    );
    event MiniBurn(uint256 id);
    event MiniBatchBurn(uint256[] ids);
    event MiniTransfer(uint256 id, address from, address to, address operator);
    event MiniSetup(
        uint32 coolingPeriod_,
        uint32 shipNumber_,
        string contractUri
    );

    constructor(
        bool _saleIsActive,
        bool _metadataFrozen,
        bool _provenanceFrozen,
        uint256 _maxMiniTokens,
        uint256 _mintPrice,
        uint256 _maxPerMint,
        string memory _baseUri,
        string memory contractUri_
    ) HRC721("MiniWallet NFT", "Mini721") {
        saleIsActive = _saleIsActive;
        if (saleIsActive) {
            saleStarted = true;
        }
        // false
        metadataFrozen = _metadataFrozen;
        //false
        provenanceFrozen = _provenanceFrozen;
        //false
        maxMiniTokens = _maxMiniTokens;
        // 10000
        mintPrice = _mintPrice;
        // 100000000000000000 = 0.01 ETH
        maxPerMint = _maxPerMint;
        // 10;
        baseUri = _baseUri;
        // "ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/";
        _contractUri = contractUri_;
        //"ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/contract.json"; //TODO review URI
    }

    modifier whenSaleActive() {
        require(saleIsActive, "Mini721: Sale is not active");
        _;
    }

    modifier whenMetadataNotFrozen() {
        require(!metadataFrozen, "Mini721: Metadata is frozen");
        _;
    }

    modifier whenProvenanceNotFrozen() {
        require(!provenanceFrozen, "Mini721: Provenance is frozen");
        _;
    }

    // ------------------
    // Explicit overrides
    // ------------------

    function _burn(uint256 tokenId) internal virtual override(HRC721) {
        super._burn(tokenId);
    }

    function setTemporaryTokenUri(string memory uri) public onlyOwner {
        temporaryTokenUri = uri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(HRC721)
        returns (string memory)
    {
        if (!metadataFrozen && bytes(temporaryTokenUri).length > 0) {
            return temporaryTokenUri;
        }
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        uint256 tid = tokenId;
        if (tid >= offsetValue) {
            tid =
                ((startIndex + tid - offsetValue) %
                    (maxMiniTokens - offsetValue)) +
                offsetValue;
        }

        if (bytes(metadataUris[tokenId]).length == 0) {
            return
                bytes(baseUri).length != 0
                    ? string(abi.encodePacked(baseUri, uint2str(tid)))
                    : "";
        }
        return metadataUris[tokenId];
    }

    function setStartIndex() external onlyOwner {
        startIndex =
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 2),
                        bytes20(msg.sender),
                        bytes32(totalSupply())
                    )
                )
            ) %
            (maxMiniTokens - offsetValue);
        emit SetStartIndex(startIndex);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            interfaceId == this.name.selector ||
            interfaceId == this.symbol.selector ||
            interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES ||
            interfaceId == _INTERFACE_ID_ERC2981 ||
            HRC721.supportsInterface(interfaceId);
    }

    // ------------------
    // Utility view functions
    // ------------------

    function exists(uint256 _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }

    //TODO review if we need to override the contractURI
    function contractURI() public view returns (string memory) {
        return _contractUri;
    }

    // ------------------
    // Functions for external (user) minting
    // ------------------

    function mintMini(uint256 amount) external payable whenSaleActive {
        require(
            totalSupply() + amount < maxMiniTokens,
            "Mini721: Purchase would exceed cap"
        );
        require(amount <= maxPerMint, "Mini721: Amount exceeds max per mint");
        require(
            mintPrice * amount <= msg.value,
            "Mini721: Ether value sent is not correct"
        );
        uint256 excess = msg.value - (amount * mintPrice);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        _safeMint(msg.sender, amount);
        emit MiniMint(totalSupply(), amount, msg.sender);
    }

    function burn(uint256 id) public onlyOwner whenMetadataNotFrozen {
        HRC721._burn(id);
        emit MiniBurn(id);
    }

    function batchBurn(uint256[] memory ids)
        public
        onlyOwner
        whenMetadataNotFrozen
    {
        for (uint32 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            HRC721._burn(id);
        }
        emit MiniBatchBurn(ids);
    }

    // ------------------
    // Functions for the owner (Mini minting contracts)
    // ------------------

    function freezeMetadata() external onlyOwner whenMetadataNotFrozen {
        metadataFrozen = true;
    }

    function freezeProvenance() external onlyOwner whenProvenanceNotFrozen {
        provenanceFrozen = true;
    }

    function toggleSaleState() external onlyOwner {
        require(
            (saleIsActive || (offsetValue != 0)),
            "cannot start sale until airdrop is complete and offset set"
        );
        saleIsActive = !saleIsActive;
        if (saleIsActive && !saleStarted) {
            saleStarted = true;
        }
    }

    function setContractUri(string memory uri_) public onlyOwner {
        _contractUri = uri_;
    }

    function setProvenanceHash(string memory _provenanceHash)
        external
        onlyOwner
        whenProvenanceNotFrozen
    {
        provenanceHash = _provenanceHash;
    }

    function setOffsetValue(uint256 _offsetValue) external onlyOwner {
        require(!saleStarted, "sale already begun");
        offsetValue = _offsetValue;
    }

    function setMaxPerMint(uint256 _maxPerMint) external onlyOwner {
        maxPerMint = _maxPerMint;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function setBaseUri(string memory _baseUri)
        external
        onlyOwner
        whenMetadataNotFrozen
    {
        baseUri = _baseUri;
        emit SetBaseUri(baseUri);
    }

    function mintForCommunity(address _to, uint256 _numberOfTokens)
        external
        onlyOwner
    {
        require(_to != address(0), "Mini721: Cannot mint to zero address.");
        require(
            totalSupply() + _numberOfTokens < maxMiniTokens,
            "Mini721: Minting would exceed cap"
        );
        _safeMint(_to, _numberOfTokens);
        emit MiniMintCommunity(totalSupply(), _numberOfTokens, _to);
    }

    function withdraw(uint256 amount, bool shouldUseRevenueAccount) public {
        require(
            msg.sender == Ownable.owner() || msg.sender == revenueAccount,
            "unauthorized"
        );
        address a = shouldUseRevenueAccount ? revenueAccount : Ownable.owner();
        (bool success, ) = a.call{value: amount}("");
        require(success);
    }

    function setUri(uint256 id, string memory uri_)
        public
        onlyOwner
        whenMetadataNotFrozen
    {
        metadataUris[id] = uri_;
    }

    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function setRevenueAccount(address account) public onlyOwner {
        revenueAccount = account;
    }

    function setRoyalties(
        uint256 _tokenId,
        address payable _royaltiesReceipientAddress,
        uint96 _percentageBasisPoints
    ) public onlyOwner {
        LibPart.Part[] memory _royalties = new LibPart.Part[](1);
        _royalties[0].value = _percentageBasisPoints;
        _royalties[0].account = _royaltiesReceipientAddress;
        _saveRoyalties(_tokenId, _royalties);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        LibPart.Part[] memory _royalties = royalties[_tokenId];
        if (_royalties.length > 0) {
            return (
                _royalties[0].account,
                (_salePrice * _royalties[0].value) / 10000
            );
        }
        return (address(0), 0);
    }

    receive() external payable {}

    // ------------------
    // Utility function for getting the tokens of a certain address
    // ------------------

    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            for (uint256 index; index < tokenCount; index++) {
                result[index] = tokenOfOwnerByIndex(_owner, index);
            }
            return result;
        }
    }
}
