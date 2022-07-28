# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat compile
npx hardhat accounts
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).

# Included Modules
The following modules are installed when creating a [hardhat advanced sample project that uses Typescript](https://hardhat.org/guides/project-setup.html)
Do you want to install this sample project's dependencies with npm (
* hardhat 
* @nomiclabs/hardhat-waffle
* ethereum-waffle 
* chai 
* @nomiclabs/hardhat-ethers 
* ethers 
* @nomiclabs/hardhat-etherscan 
* dotenv 
* eslint 
* eslint-config-prettier 
* eslint-config-standard 
* eslint-plugin-import 
* eslint-plugin-node 
* eslint-plugin-prettier 
* eslint-plugin-promise 
* hardhat-gas-reporter 
* prettier 
* prettier-plugin-solidity 
* solhint solidity-coverage 
* @typechain/ethers-v5 
* @typechain/hardhat 
* @typescript-eslint/eslint-plugin 
* @typescript-eslint/parser 
* @types/chai 
* @types/node 
* @types/mocha 
* ts-node 
* typechain 
* typescript

# Additional Plugins
The following [plugins](https://hardhat.org/plugins/) have also been added 
* [hardhat-abi-exporter](https://www.npmjs.com/package/hardhat-abi-exporter)
* [@atixlabs/hardhat-time-n-mine](https://www.npmjs.com/package/@atixlabs/hardhat-time-n-mine)
* [hardhat-spdx-license-identifier](https://www.npmjs.com/package/hardhat-spdx-license-identifier)
* [@primitivefi/hardhat-dodoc](https://www.npmjs.com/package/@primitivefi/hardhat-dodoc): Solidity Document Generation

# Additional Tools
* [slither](https://github.com/crytic/slither)
* [certora](https://www.certora.com/)