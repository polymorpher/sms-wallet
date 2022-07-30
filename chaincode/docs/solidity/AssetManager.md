# AssetManager









## Methods

### authorize

```solidity
function authorize(uint256 limit) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| limit | uint256 | undefined |

### deposit

```solidity
function deposit() external payable
```






### getUserAuthorization

```solidity
function getUserAuthorization(address user) external view returns (uint256 authorization)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| authorization | uint256 | undefined |

### getUserBalance

```solidity
function getUserBalance(address user) external view returns (uint256 balance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| balance | uint256 | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### send

```solidity
function send(uint256 amount, address from, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined |
| from | address | undefined |
| to | address | undefined |

### transfer

```solidity
function transfer(uint256 amount, enum Enums.TokenType tokenType, uint256 tokenId, address tokenAddress, address from, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined |
| tokenType | enum Enums.TokenType | undefined |
| tokenId | uint256 | undefined |
| tokenAddress | address | undefined |
| from | address | undefined |
| to | address | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### userAuthorizations

```solidity
function userAuthorizations(address) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### userBalances

```solidity
function userBalances(address) external view returns (uint256)
```





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
function withdraw(uint256 amount) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined |



## Events

### AuthorizationFailed

```solidity
event AuthorizationFailed(address depositor, uint256 userBalance, uint256 limit, string reason)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| depositor  | address | undefined |
| userBalance  | uint256 | undefined |
| limit  | uint256 | undefined |
| reason  | string | undefined |

### AuthorizationSuccesful

```solidity
event AuthorizationSuccesful(address user, uint256 newLimit, uint256 userBalance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| newLimit  | uint256 | undefined |
| userBalance  | uint256 | undefined |

### DepositSuccesful

```solidity
event DepositSuccesful(address user, uint256 amount, uint256 balance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| amount  | uint256 | undefined |
| balance  | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### SendFailed

```solidity
event SendFailed(address from, address to, uint256 amount, uint256 balance, uint256 limit, string reason)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from  | address | undefined |
| to  | address | undefined |
| amount  | uint256 | undefined |
| balance  | uint256 | undefined |
| limit  | uint256 | undefined |
| reason  | string | undefined |

### SendSuccesful

```solidity
event SendSuccesful(address from, address to, uint256 amount, uint256 newBalance, uint256 newLimit)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from  | address | undefined |
| to  | address | undefined |
| amount  | uint256 | undefined |
| newBalance  | uint256 | undefined |
| newLimit  | uint256 | undefined |

### WithdrawalFailed

```solidity
event WithdrawalFailed(address user, uint256 amount, uint256 balance, string reason)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| amount  | uint256 | undefined |
| balance  | uint256 | undefined |
| reason  | string | undefined |

### WithdrawalSuccesful

```solidity
event WithdrawalSuccesful(address user, uint256 amount, uint256 balance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| amount  | uint256 | undefined |
| balance  | uint256 | undefined |



