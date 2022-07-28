// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetManager is Ownable {
    event DepositSuccesful(address user, uint256 amount, uint256 balance);
    // event DepositFailed(
    //     address depositor,
    //     uint256 amount,
    //     uint256 balance,
    //     string reason
    // );
    event WithdrawalSuccesful(address user, uint256 amount, uint256 balance);
    event WithdrawalFailed(
        address user,
        uint256 amount,
        uint256 balance,
        string reason
    );
    event AuthorizationSuccesful(address user, uint256 newLimit, uint256 userBalance);
    event AuthorizationFailed(
        address depositor,
        uint256 userBalance,
        uint256 limit,
        string reason
    );
    event SendSuccesful(address from, address to, uint256 amount, uint256 newBalance, uint256 newLimit);
    event SendFailed(
        address from,
        address to,
        uint256 amount,
        uint256 balance,
        uint256 limit,
        string reason
    );


    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userAuthorizations;

    constructor() {}

    function getUserBalance (address user) public view returns (uint256 balance){
        return this.userBalances(address(user));
    }

    function getUserAuthorization (address user) public view returns (uint256 authorization){
        return this.userAuthorizations(address(user));
    }

    // authorize
    // send
    // transfer
    // pause

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
            emit WithdrawalFailed(
                msg.sender,
                amount,
                balance,
                "Insufficient Locked Funds to Withdraw "
            );
            return;
        }

        require(amount <= balance);
        // withdraw funds from the contract (update userBalance before transfer to protect from reentracy attack)
        uint256 newBalance = balance - amount;
        userBalances[address(msg.sender)] = newBalance;
        payable(msg.sender).transfer(amount);

        // update the authorized amount.
        uint256 currentLimit = getUserAuthorization(msg.sender);
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
        uint256 balance = getUserBalance(msg.sender);
        // uint256 currentLimit = getUserAuthorization(msg.sender);
        // uint256 newLimit = currentLimit + limit;
        if (balance < limit) {
            emit AuthorizationFailed(
                msg.sender,
                balance,
                limit,
                "New limt amount greater than users balance"
            );
            return;
        }

        require(balance >= limit);
        userAuthorizations[address(msg.sender)] = limit;

        // update the userBalance
        emit AuthorizationSuccesful(
            msg.sender,
            limit,
            balance
        );
    }
    function send(uint256 amount, address from, address to) public onlyOwner() {
        uint256 balance =  userBalances[from];
        uint256 limit = userAuthorizations[from];
        require (amount != 0);
        // check from balance
        if (amount > balance) {
            emit SendFailed(
                from,
                to,
                amount,
                balance,
                limit,
                "Insufficient Locked Funds to Send "
            );
            return;
        }
         require(amount <= balance);
        // check from balance
        if (amount > limit) {
            emit SendFailed(
                from,
                to,
                amount,
                balance,
                limit,
                "Insufficient Authorized Funds to Send "
            );
            return;
        }
         require(amount <= limit);
        // withdraw funds from the contract (update userBalance before transfer to protect from reentracy attack)
        uint256 newBalance = balance - amount;
        userBalances[address(from)] = newBalance;
        payable(to).transfer(amount);

        // update the authorized amount.
        uint256 newLimit = limit - amount;
        userAuthorizations[address(from)] = newLimit;

        // update the userBalance
        emit SendSuccesful(
            from,
            to,
            amount,
            newBalance,
            newLimit
        );
    }
}
