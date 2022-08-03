// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "./lib/SafeCast.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// import "openzeppelin-solidity/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
// import "openzeppelin-solidity/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Enums.sol";

contract AssetManager is 
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    using SafeCast for *;
    using SafeMathUpgradeable for uint256;

    event DepositSuccesful(address indexed user, uint256 amount, uint256 balance);
    event WithdrawalSuccesful(address indexed user, uint256 amount, uint256 balance);
    error WithdrawalFailed(
        address user,
        uint256 amount,
        uint256 balance,
        string reason
    );
    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // event AuthorizationSuccesful(address indexed user, uint256 newLimit, uint256 userBalance);
    error AuthorizationFailed(
        address depositor,
        uint256 userBalance,
        uint256 limit,
        string reason
    );
    event SendSuccesful(address indexed from, address indexed to, uint256 amount, uint256 newBalance, uint256 newLimit);
    error SendFailed(
        address from,
        address to,
        uint256 amount,
        uint256 balance,
        uint256 limit,
        string reason
    );
    event TransferSuccesful(uint256 amount,
        Enums.TokenType tokenType,
        uint256 tokenId, 
        address tokenAddress, 
        address indexed from, 
        address indexed to);
    error TransferFailed(
        uint256 amount,
        Enums.TokenType tokenType,
        uint256 tokenId, 
        address tokenAddress, 
        address from, 
        address to,
        string reason
    );

    event OperatorThresholdChanged(uint256 newThreshold);
    event OperatorAdded(address operator);
    event OperatorRemoved(address operator);

    uint256 public globalUserAuthLimit;
    mapping(address => uint256) public userBalances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint8 public operatorThreshold;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "sender doesn't have admin role");
        _;
    }

    modifier onlyOperators() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "sender doesn't have operator role");
        _;
    }

    function adminPauseAssetManager() external onlyAdmin {
        _pause();
    }

    function adminUnpauseAssetManager() external onlyAdmin {
        _unpause();
    }

    function renounceAdmin(address newAdmin) external onlyAdmin {
        require(msg.sender != newAdmin, 'cannot renounce self');
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function adminChangeOperatorThreshold(uint256 newThreshold) external onlyAdmin {
        operatorThreshold = newThreshold.toUint8();
        emit OperatorThresholdChanged(newThreshold);
    }

    function adminAddOperator(address operatorAddress) external onlyAdmin {
        require(!hasRole(OPERATOR_ROLE, operatorAddress), "addr already has operator role!");
        grantRole(OPERATOR_ROLE, operatorAddress);
        emit OperatorAdded(operatorAddress);
    }

    function adminRemoveOperator(address operatorAddress) external onlyAdmin {
        require(hasRole(OPERATOR_ROLE, operatorAddress), "addr doesn't have operator role!");
        revokeRole(OPERATOR_ROLE, operatorAddress);
        emit OperatorRemoved(operatorAddress);
    }

    function initialize (
        uint8 initialOperatorThreshold,
        address[] memory initialOperators,
        uint256 globalUserAuthLimit_
    ) external initializer{
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        operatorThreshold = initialOperatorThreshold;
        for (uint256 i; i < initialOperators.length; i++) {
            grantRole(OPERATOR_ROLE, initialOperators[i]);
        }
        globalUserAuthLimit = globalUserAuthLimit_;
        }

    function deposit() public payable whenNotPaused {
        userBalances[address(msg.sender)] += msg.value;
        // update the userBalance
        emit DepositSuccesful(
            msg.sender,
            msg.value,
            userBalances[address(msg.sender)]
        );
    }

        function withdraw(uint256 amount) public payable whenNotPaused {
        uint256 balance =  userBalances[address(msg.sender)];
        // if zero is passed withdraw all funds
        if (amount == 0){ amount = balance; }
        // check msg.senders balance
        if (amount > balance) {
            revert WithdrawalFailed(
                msg.sender,
                amount,
                balance,
                "Insufficient Locked Funds to Withdraw "
            );
        }

        // withdraw funds from the contract (update userBalance before transfer to protect from reentracy attack)
        uint256 newBalance = balance - amount;
        userBalances[address(msg.sender)] = newBalance;
        payable(msg.sender).transfer(amount);

        // update the userBalance
        emit WithdrawalSuccesful(
            msg.sender,
            amount,
            userBalances[address(msg.sender)]
        );
    }

    function allowance(address owner, address spender) public whenNotPaused view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public whenNotPaused returns (bool) {
        address owner = msg.sender;
        require(owner != address(0), "AssetManager: approve from the zero address");
        require(spender != address(0), "AssetManager: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
        return true;
    }

    function send(uint256 amount, address from, address to) public onlyOperators whenNotPaused() {
        uint256 balance =  userBalances[from];
        uint256 currentAllowance = allowance(from, to);
        if (amount == 0) {
            revert SendFailed(
                from,
                to,
                amount,
                balance,
                currentAllowance,
                "Send amount cannot equal 0"
            );
        }
        // check from balance
        if (amount > balance) {
            revert SendFailed(
                from,
                to,
                amount,
                balance,
                currentAllowance,
                "Insufficient Locked Funds to Send "
            );
        }
        // check from balance
        if (amount > currentAllowance) {
            revert SendFailed(
                from,
                to,
                amount,
                balance,
                currentAllowance,
                "Insufficient approved funds to send "
            );
        }
        // withdraw funds from the contract (update userBalance before transfer to protect from reentracy attack)
        uint256 newBalance = balance - amount;
        userBalances[address(from)] = newBalance;

        // update the approved amount.
        uint256 newLimit = currentAllowance - amount;
        approve(to,newLimit);

        payable(to).transfer(amount);

        emit SendSuccesful(
            from,
            to,
            amount,
            newBalance,
            newLimit
        );
    }
    function transfer( uint256 amount, Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address from, address to) public onlyOperators whenNotPaused {
    if ( tokenType == Enums.TokenType.ERC20 ) {
        bool success = ERC20(tokenAddress).transferFrom(from, to, amount);
        if (success) {
            emit TransferSuccesful(amount, tokenType, tokenId, tokenAddress, from, to);
        } else {
            revert TransferFailed(
            amount,
            tokenType,
            tokenId,
            tokenAddress,
            from,
            to,
            "Invalid tokenType "
            );
        }
    } else if ( tokenType == Enums.TokenType.ERC721 ) {
       ERC721(tokenAddress).safeTransferFrom(from, to, tokenId);
        emit TransferSuccesful(amount, tokenType, tokenId, tokenAddress, from, to);
    } else if ( tokenType == Enums.TokenType.ERC1155 ) {
        ERC1155(tokenAddress).safeTransferFrom(from, to, tokenId, amount, "");
        emit TransferSuccesful(amount, tokenType, tokenId, tokenAddress, from, to);
    } else { 
        revert TransferFailed(
            amount,
            tokenType,
            tokenId,
            tokenAddress,
            from,
            to,
            "Invalid tokenType "
            );
    }
    }
}
