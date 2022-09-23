// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "../libraries/SafeCast.sol";
import "../libraries/Enums.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
  @title An asset management contract for low value tokens and assets.
  @author John Whitton https://github.com/johnwhitton/
  @notice This contract allows users to transfer native tokens and authorize recipients
  (such as games) to receive these tokens. Once approved it can transfer the native tokens on behalf of the user.
  It also can transfer ERC20, ERC721 and ERC1155 tokens on behalf of the user, after the user approves the MiniWallet contract to do so.
  @dev The MiniWallet is designed to simplify management and transfer of tokens
  by light clients such as the sms-wallet.
 */
contract MiniWallet is
    Initializable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable,
    UUPSUpgradeable
{
    using SafeCast for *;
    using SafeMathUpgradeable for uint256;

    /**
     * @dev Emitted when a `user` deposits native tokens (`amount`) into the MiniWallet
     * `balance` is the users new balance held.
     * @param user The user depositing the native token
     * @param amount The amount of native tokens deposited
     * @param balance The users balance of native tokens held by the MiniWallet contract after the deposit
     */
    event DepositSuccessful(
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    /**
     * @dev Emitted when a `user` withdraws native tokens (`amount`) from the MiniWallet
     * `balance` is the users new balance held.
     * @param user The user withdrawing the native token
     * @param amount The amount of native tokens withdrawn
     * @param balance The users balance of native tokens held by the MiniWallet contract after the withdrawal
     */
    event WithdrawalSuccessful(
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    /**
     * @dev Emitted when an attempt by a `user` to withdraw native tokens `amount` fails
     * `balance` is the users balance held and `reason` gives the reason for failure.
     * e.g. `Insufficient Locked Funds to Withdraw`.
     * @param user The user attempting to withdraw the native token
     * @param amount The amount of native tokens requested to withdraw
     * @param balance The users balance of native tokens held by the MiniWallet contract
     */
    error WithdrawalFailed(
        address user,
        uint256 amount,
        uint256 balance,
        string reason
    );

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     * @param owner The owner of the native token which are being approved
     * @param spender The spender who can spend the native tokens (actual transferring of the funds is done by the operator)
     * @param allowance The allowance of native tokens which can be transferred by the MiniWallet Operator to the spender
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 allowance
    );

    /**
     * @dev Emitted when native tokens have been successfully sent by the operator on behalf of the `from` account
     * @param from The sender of the native token
     * @param to The recipient of the native token
     * @param amount The amount of native token sent
     * @param newBalance The updated balance of native tokens held by the MiniWallet contract on behalf of the user
     * @param newAllowance The updated allowance of native tokens which can be transferred by the MiniWallet Operator to the spender
     */
    event SendSuccessful(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 newBalance,
        uint256 newAllowance
    );

    /**
     * @dev Emitted when attempting to send native tokens by the operator on behalf of the `from` account to the `to` account fails
     * e.g. if they have insufficient native tokens locked or insufficient funds approved for the to account
     * @param from The sender of the native token
     * @param to The recipient of the native token
     * @param amount The amount of native token sent
     * @param balance The updated balance of native tokens held by the MiniWallet contract on behalf of the user
     * @param allowance The updated allowance of native tokens which can be transferred by the MiniWallet Operator to the spender
     * @param reason The reason the Send Failed
     */
    error SendFailed(
        address from,
        address to,
        uint256 amount,
        uint256 balance,
        uint256 allowance,
        string reason
    );

    /**
     * @dev Emitted when transferring tokens (ERC20, ERC721, ERC1155) by the operator on behalf of the `from` account to the `to` account
     * @param amount The amount of the token sent
     * @param tokenType an enumerated value indicating the type of token being sent
     * @param tokenAddress the address of the token contract
     * @param from The sender of the token
     * @param to The recipient of the token
     */
    event TransferSuccessful(
        uint256 amount,
        Enums.TokenType tokenType,
        uint256 tokenId,
        address tokenAddress,
        address indexed from,
        address indexed to
    );

    /**
     * @dev Emitted when an attempt to transfer tokens (ERC20, ERC721, ERC1155) by the operator on behalf of the `from` account to the `to` account fails
     * @param amount The amount of the token sent
     * @param tokenType an enumerated value indicating the type of token being sent
     * @param tokenAddress the address of the token contract
     * @param from The sender of the token
     * @param to The recipient of the token
     * @param reason The reason for the failure
     */
    error TransferFailed(
        uint256 amount,
        Enums.TokenType tokenType,
        uint256 tokenId,
        address tokenAddress,
        address from,
        address to,
        string reason
    );

    /**
     * @dev Emitted when the `DEFAULT_ADMIN` updates the maximum number of operators allowed
     * @param newThreshold The updated maximum number of operators
     */
    event OperatorThresholdChanged(uint256 newThreshold);

    /**
     * @dev Emitted when the `DEFAULT_ADMIN` adds some operators
     * @param operators The operators added
     */
    event OperatorsAdded(address[] operators);

    /**
     * @dev Emitted when the `DEFAULT_ADMIN` removes some operators
     * @param operators The operators removed
     */
    event OperatorsRemoved(address[] operators);

    /**
     * @dev Emitted when the `DEFAULT_ADMIN` changes the global limit for the amount of Native Tokens a user can authorize per recipient
     * @param newGlobalUserAuthLimit The updated global limit of native tokens a user can authorize
     */
    event GlobalUserAuthLimitChanged(uint256 newGlobalUserAuthLimit);

    /**
     * @dev Emitted when the `DEFAULT_ADMIN` changes the global limit for the amount of Native Tokens a user can hold in the MiniWallet Contract
     * @param newGlobalUserLimit The updated global limit of native tokens a user can hold
     */
    event GlobalUserLimitChanged(uint256 newGlobalUserLimit);

    /**
     * @dev The global limit for the amount of Native Tokens a user can authorize per recipient
     * This value is checked when creating allowances.
     */
    uint256 public globalUserAuthLimit;

    /**
     * @dev The global limit for the amount of Native Tokens a user can hold in the MiniWallet Contract.
     * This value is checked when depositing funds.
     */
    uint256 public globalUserLimit;

    /**
     * @dev This mapping tracks the balances of native tokens stored in the MiniWallet contract for each user
     */
    mapping(address => uint256) public userBalances;

    /**
     * @dev `_allowances` is a two layer mapping tracking the allowance each user has given each recipient.
     * It is a many to one relationship i.e. One User can create allowances for multiple recipients.
     */
    mapping(address => mapping(address => uint256)) private _allowances;

    /**
     * @dev `operatorThreshold` tracks the maximum number of allowed operators
     * Operators are responsible for transferring tokens on the users behalf.
     * There may be more than one `operator` per `relayer`
     * A `relayer` is an api server which interacts with the client (e.g. sms-wallet).
     * Multiple relayers can be run for performance and load balancing reasons.
     */
    uint8 public operatorThreshold;

    /**
     * @dev `OPERATOR_ROLE` is the role assigned to operators
     */
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /**
     * @dev `onlyAdmin` modifier is used on functions which only administrators can run
     * e.g. Updating global limits or operator Thresholds and pausing the MiniWallet contract.
     */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "sender doesn't have admin role"
        );
        _;
    }

    /**
     * @dev `onlyOperators` modifier is used on functions which only operators can run
     * e.g. Transferring tokens on behalf of users.
     */
    modifier onlyOperators() {
        require(
            hasRole(OPERATOR_ROLE, msg.sender),
            "sender doesn't have operator role"
        );
        _;
    }

    /**
     * @dev `adminPauseMiniWallet` pauses the `MiniWallet` contract
     */
    function adminPauseMiniWallet() external onlyAdmin {
        _pause();
    }

    /**
     * @dev `adminUnpauseMiniWallet` unpauses the `MiniWallet` contract
     */
    function adminUnpauseMiniWallet() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev `renounceAdmin` can only be called by the current administrator
     * It creates a new administrator and renounce the administrator role from the `msg.sender`
     * @param newAdmin the new administrator
     */
    function renounceAdmin(address newAdmin) external onlyAdmin {
        require(msg.sender != newAdmin, "cannot renounce self");
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev `adminChangeOperatorThreshold` updates the maximum number of allowed operators
     * @param newThreshold The updated maximum number of operators
     */
    function adminChangeOperatorThreshold(uint256 newThreshold)
        external
        onlyAdmin
    {
        operatorThreshold = newThreshold.toUint8();
        emit OperatorThresholdChanged(newThreshold);
    }

    /**
     * @dev `adminAddOperators` adds some new operators (can only be called by admin)
     * @param operatorAddresses The addresses of the new operators
     */
    function adminAddOperators(address[] calldata operatorAddresses)
        external
        onlyAdmin
    {
        for (uint256 i = 0; i < operatorAddresses.length; i++) {
            address operatorAddress = operatorAddresses[i];
            require(
                !hasRole(OPERATOR_ROLE, operatorAddress),
                "already has operator role"
            );
            require(
                (getRoleMemberCount(OPERATOR_ROLE) < operatorThreshold),
                "too many operators"
            );
            grantRole(OPERATOR_ROLE, operatorAddress);
        }
        emit OperatorsAdded(operatorAddresses);
    }

    /**
     * @dev `adminRemoveOperators` removes an operator (can only be called by admin)
     * @param operatorAddresses The addresses of the operators to be removed
     */
    function adminRemoveOperators(address[] calldata operatorAddresses)
        external
        onlyAdmin
    {
        for (uint256 i = 0; i < operatorAddresses.length; i++) {
            address operatorAddress = operatorAddresses[i];
            require(
                hasRole(OPERATOR_ROLE, operatorAddress),
                "removing non-operator"
            );
            revokeRole(OPERATOR_ROLE, operatorAddress);
        }
        emit OperatorsRemoved(operatorAddresses);
    }

    /**
     * @dev `adminChangeGlobalUserLimit` updates the global limit for the amount of Native Tokens a user can hold in the MiniWallet Contract.
     * This value is checked when depositing funds.
     * This function can only be called by the administrator.
     * @param newGlobalUserLimit The updated global limit.
     */
    function adminChangeGlobalUserLimit(uint256 newGlobalUserLimit)
        external
        onlyAdmin
    {
        globalUserLimit = newGlobalUserLimit;
        emit GlobalUserLimitChanged(newGlobalUserLimit);
    }

    /**
     * @dev `adminChangeGlobalUserAuthLimit` updates the global limit for the amount of Native Tokens a user can authorize per recipient
     * This value is checked when creating allowances.
     * This function can only be called by an administrator
     * @param newGlobalUserAuthLimit updated Global User Auth Limit
     */
    function adminChangeGlobalUserAuthLimit(uint256 newGlobalUserAuthLimit)
        external
        onlyAdmin
    {
        globalUserAuthLimit = newGlobalUserAuthLimit;
        emit GlobalUserAuthLimitChanged(newGlobalUserAuthLimit);
    }

    /**
     * @dev `initialize` initializes the MiniWallet contract. It should be called directly after the deploy.
     * It is used instead of a `constructor` as the `MiniWallet` is upgradeable.
     * The `msg.sender` is granted the `DEFAULT_ADMIN_ROLE`.
     * @param initialOperatorThreshold The initial maximum number of operators allowed
     * @param initialOperators The address of the initial operators (each will be granted the `OPERATOR_ROLE`)
     * @param globalUserLimit_ The initial limit of how many native tokens a user can deposit
     * @param globalUserAuthLimit_ The initial limit of how many native tokens a user can approve for a recipient
     */
    function initialize(
        uint8 initialOperatorThreshold,
        address[] calldata initialOperators,
        uint256 globalUserLimit_,
        uint256 globalUserAuthLimit_
    ) external initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        operatorThreshold = initialOperatorThreshold;
        for (uint256 i; i < initialOperators.length; i++) {
            grantRole(OPERATOR_ROLE, initialOperators[i]);
        }
        globalUserLimit = globalUserLimit_;
        globalUserAuthLimit = globalUserAuthLimit_;
    }

    /**
     * @dev `deposit` allows a user to deposit funds to the `MiniWallet` contract.
     * It uses `msg.sender` to determine the user and the `msg.value` to determine the amount to deposit.
     * The `amount` deposited needs to be less than or equal to the `globalUserLimit`
     */
    function deposit() public payable whenNotPaused {
        require(
            (userBalances[address(msg.sender)] + msg.value) <= globalUserLimit,
            "MiniWallet: deposit greater than global limit"
        );
        userBalances[msg.sender] += msg.value;
        // update the userBalance
        emit DepositSuccessful(msg.sender, msg.value, userBalances[msg.sender]);
    }

    /**
     * @dev `withdraw` withdraws an `amount` of native tokens (previously deposited by the user) and transfers them back to the user.
     * `msg.sender` is used to determine the user. If a zero amount is passed then all the native tokens held for that user are withdrawn.
     * @param amount The amount of native tokens to withdraw (zero means withdraw all tokens held for the user)
     */
    function withdraw(uint256 amount) public whenNotPaused {
        uint256 balance = userBalances[msg.sender];
        // if zero is passed withdraw all funds
        if (amount == 0) {
            amount = balance;
        }
        // check msg.senders balance
        if (amount > balance) {
            revert WithdrawalFailed(
                msg.sender,
                amount,
                balance,
                "Insufficient locked funds to withdraw"
            );
        }

        // withdraw funds from the contract (update userBalance before transfer to protect from reentrancy attack)
        uint256 newBalance = balance - amount;
        userBalances[msg.sender] = newBalance;
        payable(msg.sender).transfer(amount);

        // update the userBalance
        emit WithdrawalSuccessful(
            msg.sender,
            amount,
            userBalances[address(msg.sender)]
        );
    }

    /**
     * @dev `allowance` returns the number of tokens the `owner` has allowed the `operator` to send to the user.
     * @param owner The owner of the native tokens
     * @param spender The recipient of the native tokens
     * @return Number of tokens allowed
     */
    function allowance(address owner, address spender)
        public
        view
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev `approve` approves an amount of native tokens that the operator is allowed to send on behalf of the `msg.sender` to the `spender`.
     * The amount needs to be less than the `globalUserAuthLimit` and the `owner` and `spender` cannot be the zero address.
     * Also if funds are sent they are deposited to the users account, if the value and the users current balance exceeds the `globalUserLimit`
     * the transaction is rejected.
     * @param spender The approved recipient of the native tokens.
     * @param amount The amount of native tokens approved.
     * @return true if the amount is approved
     */
    function approve(address spender, uint256 amount)
        public
        payable
        whenNotPaused
        returns (bool)
    {
        address owner = msg.sender;
        require(
            owner != address(0),
            "MiniWallet: approve from the zero address"
        );
        require(
            spender != address(0),
            "MiniWallet: approve to the zero address"
        );
        require(
            amount <= globalUserAuthLimit,
            "MiniWallet: approve greater than global limit"
        );
        if (msg.value > 0) {
            deposit();
        }

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
        return true;
    }

    /**
     * @dev `send` is called by an `operator` to send native tokens on behalf of the user.
     * It checks the approved amount for the from and to combination and decreases the approved amount by the amount sent.
     * @param amount The amount of native tokens to send.
     * @param from The account on whose behalf the operator is sending the native tokens from
     * @param to The recipient of the native tokens.
     */
    function send(
        uint256 amount,
        address from,
        address to
    ) public onlyOperators whenNotPaused {
        uint256 balance = userBalances[from];
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
                "Insufficient locked funds to send"
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
                "Insufficient approved funds to send"
            );
        }
        // withdraw funds from the contract (update userBalance before transfer to protect from reentrancy attack)
        uint256 newBalance = balance - amount;
        userBalances[from] = newBalance;

        // update the approved amount.
        uint256 newLimit = currentAllowance - amount;
        _allowances[from][to] = newLimit;
        payable(to).transfer(amount);

        emit SendSuccessful(from, to, amount, newBalance, newLimit);
    }

    /**
     * @dev `transfer` transfers tokens (ERC20, ERC721, ERC1155).
     * The user account must have previously approved the `MiniWallet` contract to send the funds.
     * @param amount The amount of the token sent
     * @param tokenType an enumerated value indicating the type of token being sent
     * @param tokenAddress the address of the token contract
     * @param from The sender of the token
     * @param to The recipient of the token
     */
    function transfer(
        uint256 amount,
        Enums.TokenType tokenType,
        uint256 tokenId,
        address tokenAddress,
        address from,
        address to
    ) public onlyOperators whenNotPaused {
        if (tokenType == Enums.TokenType.ERC20) {
            bool success = ERC20(tokenAddress).transferFrom(from, to, amount);
            if (success) {
                emit TransferSuccessful(
                    amount,
                    tokenType,
                    tokenId,
                    tokenAddress,
                    from,
                    to
                );
            } else {
                revert TransferFailed(
                    amount,
                    tokenType,
                    tokenId,
                    tokenAddress,
                    from,
                    to,
                    "ERC20 transfer failure"
                );
            }
        } else if (tokenType == Enums.TokenType.ERC721) {
            ERC721(tokenAddress).safeTransferFrom(from, to, tokenId);
            emit TransferSuccessful(
                amount,
                tokenType,
                tokenId,
                tokenAddress,
                from,
                to
            );
        } else if (tokenType == Enums.TokenType.ERC1155) {
            ERC1155(tokenAddress).safeTransferFrom(
                from,
                to,
                tokenId,
                amount,
                ""
            );
            emit TransferSuccessful(
                amount,
                tokenType,
                tokenId,
                tokenAddress,
                from,
                to
            );
        } else {
            revert TransferFailed(
                amount,
                tokenType,
                tokenId,
                tokenAddress,
                from,
                to,
                "Invalid tokenType"
            );
        }
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
