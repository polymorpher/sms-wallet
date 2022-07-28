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



