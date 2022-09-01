// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./rarible/royalties/contracts/impl/RoyaltiesV2Impl.sol";
import "./rarible/royalties/contracts/LibPart.sol";
import "./rarible/royalties/contracts/LibRoyaltiesV2.sol";

/// Developed by: John Whitton (github: johnwhittton), Aaron Li (github: polymorpher)
contract Mini1155 is
    ERC1155,
    Ownable,
    Pausable,
    ERC1155Burnable,
    ERC1155Supply,
    RoyaltiesV2Impl
{
    // Contract logic variables
    string public contractURI;
    string public baseUri;
    bytes32 public salt;
    uint256 public mintPrice;
    uint256 public maxPerMint;
    uint256 public standardTokenId;
    uint256 public rareTokenId;
    uint256 public exchangeRatio; // # standard needed to get 1 rare
    uint256 public rareProbabilityPercentage; // chance to get rare token during minting

    // Contract admin variables
    address public revenueAccount;
    string public name;
    string public symbol;
    bool public saleIsActive;
    bool public saleStarted;
    bool public metadataFrozen;

    // Token specific public variables
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public maxPersonalCap;
    mapping(uint256 => string) public metadataUris;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    event SetBaseUri(string baseUri);
    event Mini1155Mint(
        uint256 standardTokenId,
        uint256 numStandardTokens,
        uint256 rareTokenId,
        uint256 numRareTokens,
        address initialOwner
    );
    event Mini1155MintCommunity(
        uint256 tokenId,
        uint256 numTokens,
        address initialOwner
    );
    event Mini1155Transfer(
        uint256 id,
        address from,
        address to,
        address operator
    );

    constructor(
        bool _saleIsActive,
        bool _metadataFrozen,
        uint256 _mintPrice,
        uint256 _maxPerMint,
        uint256 _standardTokenId,
        uint256 _rareTokenId,
        uint256 _exchangeRatio,
        uint256 _rareProbabilityPercentage,
        bytes32 _salt,
        string memory _baseUri,
        string memory _contractUri
    ) ERC1155(_baseUri) {
        saleIsActive = _saleIsActive;
        if (saleIsActive) {
            saleStarted = true;
        }
        metadataFrozen = _metadataFrozen;
        mintPrice = _mintPrice;
        maxPerMint = _maxPerMint;
        standardTokenId = _standardTokenId;
        rareTokenId = _rareTokenId;
        exchangeRatio = _exchangeRatio;
        rareProbabilityPercentage = _rareProbabilityPercentage;
        salt = _salt;
        contractURI = _contractUri;
        baseUri = _baseUri;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // Begin Mini1155 Enhancements
    modifier whenSaleActive() {
        require(saleIsActive, "sale not active");
        _;
    }

    modifier whenMetadataNotFrozen() {
        require(!metadataFrozen, "metadata frozen");
        _;
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
            super.supportsInterface(interfaceId);
    }

    function mint(uint256 _amount) external payable whenSaleActive {
        require(_amount > 0, "minting too few");
        require(_amount <= maxPerMint, "exceeded per mint limit");
        require(mintPrice * _amount <= msg.value, "insufficient payment");
        uint256 excess = msg.value - (_amount * mintPrice);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        bool isRare = false;
        uint256 standardBalance = ERC1155.balanceOf(
            msg.sender,
            standardTokenId
        );
        uint256 rareBalance = ERC1155.balanceOf(msg.sender, rareTokenId);
        uint256 rareSupply = ERC1155Supply.totalSupply(rareTokenId);
        if (
            rareSupply < maxSupply[rareTokenId] &&
            rareBalance < maxPersonalCap[rareTokenId]
        ) {
            uint256 roll = uint256(
                keccak256(
                    bytes.concat(
                        salt,
                        bytes20(msg.sender),
                        bytes32(standardBalance),
                        bytes32(rareBalance)
                    )
                )
            ) % 100;
            if (roll < (rareProbabilityPercentage * _amount)) {
                isRare = true;
            }
        }
        if (isRare) {
            _amount -= 1;
            _mint(msg.sender, rareTokenId, 1, "");
        }
        if (_amount > 0) {
            require(
                totalSupply(standardTokenId) + _amount <=
                    maxSupply[standardTokenId],
                "standard token supply cap exceeded"
            );
            require(
                standardBalance + _amount <= maxPersonalCap[standardTokenId],
                "standard token personal cap exceeded"
            );
            _mint(msg.sender, standardTokenId, _amount, "");
        }
        emit Mini1155Mint(
            standardTokenId,
            _amount,
            rareTokenId,
            isRare ? 1 : 0,
            msg.sender
        );
    }

    function exchange() public {
        require(exchangeRatio > 0, "exchange not enabled");
        uint256 standardBalance = ERC1155.balanceOf(
            msg.sender,
            standardTokenId
        );
        require(standardBalance >= exchangeRatio, "too few standard tokens");
        _burn(msg.sender, standardTokenId, exchangeRatio);
        _mint(msg.sender, rareTokenId, 1, "");
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (bytes(metadataUris[id]).length == 0) {
            return string(abi.encodePacked(baseUri, uint2str(id), ".json"));
        }
        return metadataUris[id];
    }

    // ------------------
    // Functions for the owner (MiniWallet minting contracts)
    // ------------------

    // Explicit Overrides
    function burn(
        address _address,
        uint256 _tokenId,
        uint256 _amount
    ) public override(ERC1155Burnable) onlyOwner {
        ERC1155Burnable.burn(_address, _tokenId, _amount);
    }

    function burnBatch(
        address _address,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) public override(ERC1155Burnable) onlyOwner {
        ERC1155Burnable.burnBatch(_address, _tokenIds, _amounts);
    }

    function freezeMetadata() external onlyOwner whenMetadataNotFrozen {
        metadataFrozen = true;
    }

    function toggleSaleState() external onlyOwner {
        // require ((saleIsActive || (offsetValue != 0)), "cannot start sale until airdrop is complete and offset set");
        saleIsActive = !saleIsActive;
        if (saleIsActive && !saleStarted) {
            saleStarted = true;
        }
    }

    function setContractUri(string memory uri_)
        public
        whenMetadataNotFrozen
        onlyOwner
    {
        contractURI = uri_;
    }

    function setMaxPerMint(uint256 _maxPerMint) external onlyOwner {
        maxPerMint = _maxPerMint;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function setMaxSupply(uint256 _tokenId, uint256 _cap) external onlyOwner {
        maxSupply[_tokenId] = _cap;
    }

    function setMaxPersonalCap(uint256 _tokenId, uint256 _cap)
        external
        onlyOwner
    {
        maxPersonalCap[_tokenId] = _cap;
    }

    function setStandardTokenId(uint256 _tokenId) external onlyOwner {
        standardTokenId = _tokenId;
    }

    function setRareTokenId(uint256 _tokenId) external onlyOwner {
        rareTokenId = _tokenId;
    }

    function setExchangeRatio(uint256 _exchangeRatio) external onlyOwner {
        exchangeRatio = _exchangeRatio;
    }

    function setRareProbabilityPercentage(uint256 _rareProbabilityPercentage)
        external
        onlyOwner
    {
        rareProbabilityPercentage = _rareProbabilityPercentage;
    }

    function setBaseUri(string memory _baseUri)
        external
        onlyOwner
        whenMetadataNotFrozen
    {
        baseUri = _baseUri;
        emit SetBaseUri(baseUri);
    }

    function mintAsOwner(
        address _to,
        uint256 _tokenId,
        uint256 _numberOfTokens
    ) external onlyOwner {
        require(_to != address(0), "zero to-address");
        if (maxSupply[_tokenId] > 0) {
            require(
                totalSupply(_tokenId) + _numberOfTokens <= maxSupply[_tokenId],
                "supply exceeded"
            );
        }
        _mint(_to, _tokenId, _numberOfTokens, "");
        emit Mini1155MintCommunity(_tokenId, _numberOfTokens, _to);
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

    function setSalt(bytes32 _salt) public onlyOwner {
        salt = _salt;
    }

    function setNameSymbol(string memory name_, string memory symbol_)
        public
        onlyOwner
    {
        name = name_;
        symbol = symbol_;
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

    // royalty stuff

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

    // accept deposit

    receive() external payable {}
}
