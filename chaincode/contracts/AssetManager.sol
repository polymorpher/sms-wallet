// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Enums.sol";

contract AssetManager is Ownable {
    event DepositSuccesful(address indexed user, uint256 amount, uint256 balance);
    event WithdrawalSuccesful(address indexed user, uint256 amount, uint256 balance);
    error WithdrawalFailed(
        address user,
        uint256 amount,
        uint256 balance,
        string reason
    );
    event AuthorizationSuccesful(address indexed user, uint256 newLimit, uint256 userBalance);
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

    address private _operator;
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userAuthorizations;

    constructor(address operator_) {
        setOperator(operator_);
        }

    modifier onlyOperator {
        require(msg.sender == _operator, "Can only be called by Operator");
        _;
    }

    modifier onlyOwnerOrOperator {
        bool ownerOperator = ((msg.sender == owner()) || (msg.sender == operator()));
        require(ownerOperator, "Can only be called by Owner or Operator");
        _;
    }

    /**
     * @dev Returns the address of the current operator.
     */
    function operator() public view virtual returns (address) {
        return _operator;
    }

    function setOperator(address operator_) onlyOwnerOrOperator public {
        _operator = operator_;
    }

    function deposit() public payable {
        userBalances[address(msg.sender)] += msg.value;
        // update the userBalance
        emit DepositSuccesful(
            msg.sender,
            msg.value,
            userBalances[address(msg.sender)]
        );
    }

        function withdraw(uint256 amount) public payable {
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

        // update the authorized amount.
        uint256 currentLimit = this.userAuthorizations(address(msg.sender));
        if (currentLimit > newBalance ) { authorize(newBalance); }

        // update the userBalance
        emit WithdrawalSuccesful(
            msg.sender,
            amount,
            userBalances[address(msg.sender)]
        );
    }

    function authorize(uint256 limit) public {
        // check msg.senders balance
        uint256 balance = this.userBalances(address(msg.sender));
        // uint256 currentLimit = getUserAuthorization(msg.sender);
        // uint256 newLimit = currentLimit + limit;
        if (balance < limit) {
            revert AuthorizationFailed(
                msg.sender,
                balance,
                limit,
                "New limt amount greater than users balance"
            );
        }

        userAuthorizations[address(msg.sender)] = limit;

        // update the userBalance
        emit AuthorizationSuccesful(
            msg.sender,
            limit,
            balance
        );
    }
    function send(uint256 amount, address from, address to) public onlyOperator() {
        uint256 balance =  userBalances[from];
        uint256 limit = userAuthorizations[from];
        if (amount == 0) {
            revert SendFailed(
                from,
                to,
                amount,
                balance,
                limit,
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
                limit,
                "Insufficient Locked Funds to Send "
            );
        }
        // check from balance
        if (amount > limit) {
            revert SendFailed(
                from,
                to,
                amount,
                balance,
                limit,
                "Insufficient Authorized Funds to Send "
            );
        }
        // withdraw funds from the contract (update userBalance before transfer to protect from reentracy attack)
        uint256 newBalance = balance - amount;
        userBalances[address(from)] = newBalance;

        // update the authorized amount.
        uint256 newLimit = limit - amount;
        userAuthorizations[address(from)] = newLimit;

        payable(to).transfer(amount);

        emit SendSuccesful(
            from,
            to,
            amount,
            newBalance,
            newLimit
        );
    }
    function transfer( uint256 amount, Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address from, address to) public onlyOperator {
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
