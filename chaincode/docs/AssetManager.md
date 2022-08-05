# AssetManager

*John Whitton https://github.com/johnwhitton/*

> An asset management contract for low value tokens and assets.

This contract allows users to transfer native tokens and authorize recipients (such as games) to receive these tokens. Once approved it can transfer the native tokens on behalf of the user. It also can transfer ERC20, ERC721 and ERC1155 tokens on behalf of the user, after the user approves the AssetManager contract to do so.

*The AssetManager is designed to simplify managment and transfer of tokens by light clients such as the sms-wallet.*

## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### OPERATOR_ROLE

```solidity
function OPERATOR_ROLE() external view returns (bytes32)
```



*`OPERATOR_ROLE` is the role assigned to operators*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### adminAddOperator

```solidity
function adminAddOperator(address operatorAddress) external nonpayable
```



*`adminAddOperator` adds a new operator (can only be called by admin)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operatorAddress | address | The address of the new operator  |

### adminChangeGlobalUserAuthLimit

```solidity
function adminChangeGlobalUserAuthLimit(uint256 newGlobalUserAuthLimit) external nonpayable
```



*`adminChangeGlobalUserAuthLimit` updats the global limit for the amount of Native Tokens a user can authorize per recipient  This value is checked when creating allowances.  This function can on ly be called by an administrator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newGlobalUserAuthLimit | uint256 | updated Global User Auth Limit |

### adminChangeGlobalUserLimit

```solidity
function adminChangeGlobalUserLimit(uint256 newGlobalUserLimit) external nonpayable
```



*`adminChangeGlobalUserLimit` updates the global limit for the amount of Native Tokens a user can hold in the AssetManager Contract. This value is checked when depositing funds. This function can only be called by the administrator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newGlobalUserLimit | uint256 | The updated global limit.  |

### adminChangeOperatorThreshold

```solidity
function adminChangeOperatorThreshold(uint256 newThreshold) external nonpayable
```



*`adminChangeOperatorThreshold` updates the maximum number of allowed operators*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newThreshold | uint256 | The updated maximum number of operators |

### adminPauseAssetManager

```solidity
function adminPauseAssetManager() external nonpayable
```



*`adminPauseAssetManager` pauses the `AssetManager` contract*


### adminRemoveOperator

```solidity
function adminRemoveOperator(address operatorAddress) external nonpayable
```



*`adminRemoveOperator` removes an operator (can only be called by admin)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operatorAddress | address | The address of the operator to be removed  |

### adminUnpauseAssetManager

```solidity
function adminUnpauseAssetManager() external nonpayable
```



*`adminUnpauseAssetManager` unpauses the `AssetManager` contract*


### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```



*`allowance` returns the number of takens the `owner` has allowed the `operator` to send to the user.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | The owner of the native tokens |
| spender | address | The recipient of the native tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Number of tokens allowed |

### approve

```solidity
function approve(address spender, uint256 amount) external nonpayable returns (bool)
```



*`approve` approves an amount of native tokens that the operator is allowed to send on behalf of the `msg.sender` to the `spender`.  The amount needs to be less than the `globalUserAuthLimit` and the `owner` and `spender` cannot be the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | The approved recipient of the native tokens. |
| amount | uint256 | The amount of native tokens approved. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if the amount is approved |

### deposit

```solidity
function deposit() external payable
```



*`deposit` allows a user to deposit funds to the `AssetManager` contract. It uses `msg.sender` to determine the user and the `msg.value` to determine the amount to deposit. The `amount` deposited needs to be less than or equal to the `globalUserLimit*


### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### globalUserAuthLimit

```solidity
function globalUserAuthLimit() external view returns (uint256)
```



*The global limit for the amount of Native Tokens a user can authorize per recipient  This value is checked when creating allowances.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### globalUserLimit

```solidity
function globalUserLimit() external view returns (uint256)
```



*The global limit for the amount of Native Tokens a user can hold in the AssetManager Contract. This value is checked when depositing funds.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleGranted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### initialize

```solidity
function initialize(uint8 initialOperatorThreshold, address[] initialOperators, uint256 globalUserLimit_, uint256 globalUserAuthLimit_) external nonpayable
```



*`initialize` initializes the AssetManager contract it should be called directly after the deploy.  It is used instead of a `constructor` as the `AssetManager` is upgradeable.  The `msg.sender` is granted the `DEFAULT_ADMIN_ROLE`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| initialOperatorThreshold | uint8 | The initial maximum number of operators allowed |
| initialOperators | address[] | The address of the initial operators (each will be granted the `OPERATOR_ROLE`) |
| globalUserLimit_ | uint256 | The initial limit of how many native tokens a user can deposit |
| globalUserAuthLimit_ | uint256 | The initial linmit of how many native tokens a user can approve for a recipient  |

### operatorThreshold

```solidity
function operatorThreshold() external view returns (uint8)
```



*`operatorThreshold` tracks the maximum number of allowed operators Operators are responsible for transferring tokens on the users behalf. Typically there is one `operator` per `relayer`  A `relayer` is an api server which interacts with the client (e.g. sms-wallet). Multiple relayers can be run for performance and load balancing reasons.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined |

### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### renounceAdmin

```solidity
function renounceAdmin(address newAdmin) external nonpayable
```



*`renounceAdmin` can only be called by the current administrator It creates a new administrator and renounce the adminstrator role from the `msg.sender`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAdmin | address | the new administrator |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### send

```solidity
function send(uint256 amount, address from, address to) external nonpayable
```



*`send` is called by an `operator` to send native tokens on behalf of the user.  It checks the approved amount for the from and to combination and decreases the approved amount by the amount sent.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of native tokens to send. |
| from | address | The account on whose behalf the operator is sending the native tokens from |
| to | address | The recipient of the native tokens. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transfer

```solidity
function transfer(uint256 amount, enum Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address from, address to) external nonpayable
```



*`transfer` transfers tokens (ERC20, ERC721, ERC1155).  The user account must have previously approved the `AssetManager` contract to send the funds.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of the token sent  |
| tokenType | enum Enums.TokenType | an enumerated value indicating the type of token being sent |
| tokenId | uint256 | undefined |
| tokenAddress | address | the address of the token contract  |
| from | address | The sender of the token |
| to | address | The recipient of the token |

### userBalances

```solidity
function userBalances(address) external view returns (uint256)
```



*This mapping tracks the balances of native tokens stored in the AssetManager contract for each user*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### withdraw

```solidity
function withdraw(uint256 amount) external nonpayable
```



*`withdraw` withdraws an `amount` of native tokens (previously deposited by the user) and transfers them back to the user.  `msg.sender` is used to determine the user. If a zero amount is passed then all the native tokens held for that user are withdrawn.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of native tokens to withdraw (zero means withdraw all tokens held for the user) |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 allowance)
```



*Emitted when the allowance of a `spender` for an `owner` is set by a call to {approve}. `value` is the new allowance.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | The owner of the native token which are being approved |
| spender `indexed` | address | The spender who can spend the native tokens (actual transferring of the funds is done by the operator) |
| allowance  | uint256 | The allowance of native tokens which can be transferred by the AssetManager Operator to the spender |

### DepositSuccesful

```solidity
event DepositSuccesful(address indexed user, uint256 amount, uint256 balance)
```



*Emitted when a `user` deposits native tokens (`amount`) into the AssetManager `balance` is the users new balance held.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user `indexed` | address | The user depositing the native token |
| amount  | uint256 | The amount of native tokens deposited |
| balance  | uint256 | The users balance of native tokens held by the AssetManager contract after the deposit |

### GlobalUserAuthLimitChanged

```solidity
event GlobalUserAuthLimitChanged(uint256 newGlobalUserAuthLimit)
```



*Emitted when the `DEFAULT_ADMIN` changes the global limit for the amount of Native Tokens a user can authorize per recipient*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newGlobalUserAuthLimit  | uint256 | The updated global limit of native tokens a user can authorize |

### GlobalUserLimitChanged

```solidity
event GlobalUserLimitChanged(uint256 newGlobalUserLimit)
```



*Emitted when the `DEFAULT_ADMIN` changes the global limit for the amount of Native Tokens a user can hold in the AssetManager Contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newGlobalUserLimit  | uint256 | The updated global limit of native tokens a user can hold |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### OperatorAdded

```solidity
event OperatorAdded(address operator)
```



*Emitted when the `DEFAULT_ADMIN` adds an operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator  | address | The operator added |

### OperatorRemoved

```solidity
event OperatorRemoved(address operator)
```



*Emitted when the `DEFAULT_ADMIN` removes an operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator  | address | The operator removed |

### OperatorThresholdChanged

```solidity
event OperatorThresholdChanged(uint256 newThreshold)
```



*Emitted when the `DEFAULT_ADMIN` updates the maximum number of operators allowed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newThreshold  | uint256 | The updated maximum number of operators |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### SendSuccesful

```solidity
event SendSuccesful(address indexed from, address indexed to, uint256 amount, uint256 newBalance, uint256 newAllowance)
```



*Emitted when native tokens have been succesfully sent by the operator on behalf of the `from` account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | The sender of the native token |
| to `indexed` | address | The recipient of the native token |
| amount  | uint256 | The amount of native token sent |
| newBalance  | uint256 | The updated balance of native tokens held by the AssetManager contract on behalf of the user |
| newAllowance  | uint256 | The updated allowance of native tokens which can be transferred by the AssetManager Operator to the spender |

### TransferSuccesful

```solidity
event TransferSuccesful(uint256 amount, enum Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address indexed from, address indexed to)
```



*Emitted when transferring tokens (ERC20, ERC721, ERC1155) by the operator on behalf of the `from` account to the `to` account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount  | uint256 | The amount of the token sent  |
| tokenType  | enum Enums.TokenType | an enumerated value indicating the type of token being sent |
| tokenId  | uint256 | undefined |
| tokenAddress  | address | the address of the token contract  |
| from `indexed` | address | The sender of the token |
| to `indexed` | address | The recipient of the token |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### WithdrawalSuccesful

```solidity
event WithdrawalSuccesful(address indexed user, uint256 amount, uint256 balance)
```



*Emitted when a `user` withdraws native tokens (`amount`) from the AssetManager `balance` is the users new balance held.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user `indexed` | address | The user withdrawaing the native token |
| amount  | uint256 | The amount of native tokens withdrawn |
| balance  | uint256 | The users balance of native tokens held by the AssetManager contract after the withdrawal |



## Errors

### SendFailed

```solidity
error SendFailed(address from, address to, uint256 amount, uint256 balance, uint256 allowance, string reason)
```



*Emitted when attempting to send native tokens by the operator on behalf of the `from` account to the `to` account fails e.g. if they have insufficient native tokens locked or insufficient funds approved for the to account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The sender of the native token |
| to | address | The recipient of the native token |
| amount | uint256 | The amount of native token sent |
| balance | uint256 | The updated balance of native tokens held by the AssetManager contract on behalf of the user |
| allowance | uint256 | The updated allowance of native tokens which can be transferred by the AssetManager Operator to the spender |
| reason | string | The reason the Send Failed  |

### TransferFailed

```solidity
error TransferFailed(uint256 amount, enum Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address from, address to, string reason)
```



*Emitted when an attempt to transfer tokens (ERC20, ERC721, ERC1155) by the operator on behalf of the `from` account to the `to` account fails*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of the token sent  |
| tokenType | enum Enums.TokenType | an enumerated value indicating the type of token being sent |
| tokenId | uint256 | undefined |
| tokenAddress | address | the address of the token contract  |
| from | address | The sender of the token |
| to | address | The recipient of the token |
| reason | string | The reason for the failure |

### WithdrawalFailed

```solidity
error WithdrawalFailed(address user, uint256 amount, uint256 balance, string reason)
```



*Emitted when an attempt by a `user` to withdraw native tokens `amount` fails  `balance` is the users balance held and `reason` gives the reason for failure. e.g. `Insufficient Locked Funds to Withdraw`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The user attempting to withdraw the native token |
| amount | uint256 | The amount of native tokens requested to withdraw |
| balance | uint256 | The users balance of native tokens held by the AssetManager contract |
| reason | string | undefined |


