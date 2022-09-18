# Overview

Miniwallet has three streams of smart contract development, they are miniWallet, miniID and miniNFT's. We also have requirements around both deployment and testing. To support these requirements we need the ability to independently deploy and test each work stream.

## Directory Structure

Two types of directory structures were considered:

1. Independent high level folders for each stream similar to projects such as [sushiswap](https://github.com/sushiswap/sushiswap/tree/master/protocols)
2. Sub Folders under both contracts and testing similar to projects such as [aave](https://github.com/aave/aave-v3-core/tree/master/contracts)
3. Seperate Repositories like [Uniswap](https://github.com/uniswap) with [v3-core](https://github.com/Uniswap/v3-core) and [v3-periphery](https://github.com/Uniswap/v3-periphery)

Initially it was felt that the individual streams being developed closely together so we chose option 2. This may be revisited as further development in each stream is progressed.

## Configuration and Environment Variables

We wished to support the following:

1. Deployment for each environment without changing the codebase through the use of environment variables.
2. Reducing complexity of configuration by breaking the configuration into functional components.

To achieve this we have used the following folder structures

1. `.env` folder

```
miniID.env
miniNFTs.env
miniWallet.env
networks.env
users.env
```

2. `.config` folder

```
getConfig.ts
miniID.ts
miniNFTs.ts
miniWallet.ts
users.ts
```

### Deploying to multiple environments.

If no network specific configuration is needed then by default we will use the above Configuration and Environment Variables.

Currently, to define the deployment in a new environment, two files must be created:

1. `./config/<<identifier>>_<<networkName>>.ts`
2. `./env/<<identifier>>_<<networkName>>.env`

The deploy scripts leverage `getConfig.ts` which takes two input parameters: the `identifier`, and `networkName`.

For example, when deploying the miniWallet on Harmony mainnet, the following files would be created:

1. `./config/miniWallet_mainnet.ts`
2. `./env/miniWallet_mainnet.env`

### Future considerations

1. Improve deployment to only need a new `.env` file, not a config file
2. Consider whether the deployment configuration can just use a config file rather than a config file using a `.env` file.
3. Evaluate whether to separate the folders into a more independent directory, as stated in Directory Structure (1) above.
