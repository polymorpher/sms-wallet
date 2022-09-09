import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  mainnet: {
    miniWallet: {
      initialOperatorThreshold: process.env.MINIWALLET_INITIAL_OPERATOR_THRESHOLD,
      initialOperators: JSON.parse(process.env.MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_USER_LIMIT || '1000000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_AUTH_LIMIT || '100000')
    },
    miniID: {
      baseUri: process.env.MINIID_BASE_URI || 'ipfs://QmcD2PPaiHyK7Z4n6JJTCnosSwrrPKKzERAvWJc4imEDju/MiniID'
    },
    mini721: {
      saleIsActive: process.env.MINI721_DEPLOY_SALES_IS_ACTIVE || false,
      metadataFrozen: process.env.MINI721_DEPLOY_METADATA_FROZEN || false,
      provenanceFrozen: process.env.MINI721_DEPLOY_PROVENANCE_FROZEN || false,
      max721Tokens: process.env.MINI721_DEPLOY_MAX721_TOKENS || 1000000000000,
      mintPrice: ethers.utils.parseEther(process.env.MINI721_DEPLOY_MINT_PRICE || '0'),
      maxPerMint: process.env.MINI721_DEPLOY_MAX_PER_MINT || 1,
      baseUri: process.env.MINI721_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
      contractUri: process.env.MINI721_DEPLOY_CONTRACT_URI || 'ipfs://Qmezo5wDKz7kH'
    },
    mini1155: {
      deploy: {
        name: process.env.MINI1155_DEPLOY_NAME || 'MiniWallet',
        symbol: process.env.MINI1155_DEPLOY_SYMBOL || 'Mini1155',
        salt: ethers.utils.formatBytes32String(process.env.MINI1155_DEPLOY_SALT || '1'),
        baseUri: process.env.MINI1155_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
        contractUri: process.env.MINI1155_DEPLOY_CONTRACT_URI || 'ipfs://QmdKB6d1zT7R8dNmEQzc6N1m5p2LDJZ66Hzu8F4fGhdVrq',
        revenueAccount: process.env.MINI1155_DEPLOY_REVENUE_ACCOUNT,
        saleIsActive: process.env.MINI1155_DEPLOY_SALE_IS_ACTIVE === 'true' || process.env.TEST_MINI1155_DEPLOY_SALE_IS_ACTIVE === '1',
        metadataFrozen: process.env.MINI1155_DEPLOY_METADATA_FROZEN === 'true' || process.env.TEST_MINI1155_DEPLOY_METADATA_FROZEN === '1',
        mintPrice: ethers.utils.parseEther(process.env.MINI1155_DEPLOY_MINT_PRICE || '0'),
        exchangeRatio: process.env.MINI1155_DEPLOY_EXCHANGE_RATIO || 0, // will be 20 after sale
        rareProbabilityPercentage: process.env.MINI1155_DEPLOY_RARE_PROBABLITY_PERCENTAGE || 1,
        maxPerMint: process.env.MINI1155_DEPLOY_MAX_PER_MINT || 10,
        // standard token configuration
        s: {
          tokenId: process.env.MINI1155_DEPLOY_STANDARD_TOKEN_ID || 1,
          maxSupply: process.env.MINI1155_DEPLOY_STANDARD_TOKEN_MAX_SUPPLY || 770,
          personalCap: process.env.MINI1155_DEPLOY_STANDARD_TOKEN_PERSONAL_CAP || 10
        },
        // rare token configuration
        r: {
          tokenId: process.env.MINI1155_DEPLOY_RARE_TOKEN_ID || 2,
          maxSupply: process.env.MINI1155_DEPLOY_RARE_TOKEN_MAX_SUPPLY || 7, // will be 84 after Sale
          personalCap: process.env.MINI1155_DEPLOY_RARE_TOKEN_PERSONAL_CAP || 1
        }
      }
    }
  },

  test: {
    operator: JSON.parse(process.env.TEST_MINIWALLET_INITIAL_OPERATORS || '[]')[0] || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',

    user: process.env.TEST_USER || '0xEf4634BdBc6F6528EacB49278d7E17BCB9e2689A',
    creator: process.env.TEST_CREATOR || '0x1cf6490889A92371fdBC610C4A862061F28BaFfA',
    miniWallet: {
      initialOperatorThreshold: process.env.TEST_MINIWALLET_INITIAL_OPERATOR_THRESHOLD,
      initialOperators: JSON.parse(process.env.TEST_MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.TEST_MINIWALLET_INIITIAL_USER_LIMIT || '1000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.TEST_MINIWALLET_INIITIAL_AUTH_LIMIT || '100')
    },
    miniID: {
      baseUri: process.env.TEST_MINIID_BASE_URI || 'ipfs://QmcD2PPaiHyK7Z4n6JJTCnosSwrrPKKzERAvWJc4imEDju/MiniID'
    },
    mini721: {
      saleIsActive: process.env.TEST_MINI721_DEPLOY_SALES_IS_ACTIVE || false,
      metadataFrozen: process.env.TEST_MINI721_DEPLOY_METADATA_FROZEN || false,
      provenanceFrozen: process.env.TEST_MINI721_DEPLOY_PROVENANCE_FROZEN || false,
      max721Tokens: process.env.TEST_MINI721_DEPLOY_MAX721_TOKENS || 1000000000000,
      mintPrice: ethers.utils.parseEther(process.env.TEST_MINI721_DEPLOY_MINT_PRICE || '0'),
      maxPerMint: process.env.TEST_MINI721_DEPLOY_MAX_PER_MINT || 1,
      baseUri: process.env.TEST_MINI721_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
      contractUri: process.env.TEST_MINI721_DEPLOY_CONTRACT_URI || 'ipfs://Qmezo5wDKz7kH'
    },
    mini1155: {
      collection1: {
        revenueAccount: process.env.TEST_MINI1155_COLLECTION1_REVENUE_ACCOUNT,
        maxPerMint: process.env.TEST_MINI1155_COLLECTION1_MAX_PER_MINT || 10,
        mintPrice: ethers.utils.parseEther(process.env.TEST_MINI1155_COLLECTION1_MINT_PRICE || '0.042'),
        exchangeRatio: process.env.TEST_MINI1155_COLLECTION1_EXCHANGE_RATIO || 0,
        rareProbabilityPercentage: process.env.TEST_MINI1155_COLLECTION1_RARE_PROBABLITY_PERCENTAGE || 1,
        // standard token configuration
        s: {
          tokenId: process.env.TEST_MINI1155_COLLECTION1_STANDARD_TOKEN_ID || 1,
          maxSupply: process.env.TEST_MINI1155_COLLECTION1_STANDARD_TOKEN_MAX_SUPPLY || 770,
          personalCap: process.env.TEST_MINI1155_COLLECTION1_STANDARD_TOKEN_PERSONAL_CAP || 10
        },
        // rare token configuration
        r: {
          tokenId: process.env.TEST_MINI1155_COLLECTION1_RARE_TOKEN_ID || 2,
          maxSupply: process.env.TEST_MINI1155_COLLECTION1_RARE_TOKEN_MAX_SUPPLY || 7, // will be 84 after Sale
          personalCap: process.env.TEST_MINI1155_COLLECTION1_RARE_TOKEN_PERSONAL_CAP || 1
        }
      },
      collection2: {
        revenueAccount: process.env.TEST_MINI1155_COLLECTION2_REVENUE_ACCOUNT,
        maxPerMint: process.env.TEST_MINI1155_COLLECTION2_MAX_PER_MINT || 20,
        mintPrice: ethers.utils.parseEther(process.env.TEST_MINI1155_COLLECTION2_MINT_PRICE || '0.084'),
        exchangeRatio: process.env.TEST_MINI1155_COLLECTION2_EXCHANGE_RATIO || 0,
        rareProbabilityPercentage: process.env.TEST_MINI1155_COLLECTION2_RARE_PROBABLITY_PERCENTAGE || 2,
        // standard token configuration
        s: {
          tokenId: process.env.TEST_MINI1155_COLLECTION2_STANDARD_TOKEN_ID || 3,
          maxSupply: process.env.TEST_MINI1155_COLLECTION2_STANDARD_TOKEN_MAX_SUPPLY || 1540,
          personalCap: process.env.TEST_MINI1155_COLLECTION2_STANDARD_TOKEN_PERSONAL_CAP || 20
        },
        // rare token configuration
        r: {
          tokenId: process.env.TEST_MINI1155_COLLECTION2_RARE_TOKEN_ID || 4,
          maxSupply: process.env.TEST_MINI1155_COLLECTION2_RARE_TOKEN_MAX_SUPPLY || 28, // will be 84 after Sale
          personalCap: process.env.TEST_MINI1155_COLLECTION2_RARE_TOKEN_PERSONAL_CAP || 2
        }
      },
      deploy: {
        name: process.env.TEST_MINI1155_DEPLOY_NAME || 'MiniWallet',
        symbol: process.env.TEST_MINI1155_DEPLOY_SYMBOL || 'Mini1155',
        salt: ethers.utils.formatBytes32String(process.env.TEST_MINI1155_DEPLOY_SALT || '1'),
        baseUri: process.env.TEST_MINI1155_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
        contractUri: process.env.TEST_MINI1155_DEPLOY_CONTRACT_URI || 'ipfs://QmdKB6d1zT7R8dNmEQzc6N1m5p2LDJZ66Hzu8F4fGhdVrq',
        revenueAccount: process.env.TEST_MINI1155_DEPLOY_REVENUE_ACCOUNT,
        saleIsActive: process.env.TEST_MINI1155_DEPLOY_SALE_IS_ACTIVE === 'true' || process.env.TEST_MINI1155_DEPLOY_SALE_IS_ACTIVE === '1',
        metadataFrozen: process.env.TEST_MINI1155_DEPLOY_METADATA_FROZEN === 'true' || process.env.TEST_MINI1155_DEPLOY_METADATA_FROZEN === '1',
        mintPrice: ethers.utils.parseEther(process.env.TEST_MINI1155_DEPLOY_MINT_PRICE || '0'),
        exchangeRatio: process.env.TEST_MINI1155_DEPLOY_EXCHANGE_RATIO || 0, // will be 20 after sale
        rareProbabilityPercentage: process.env.TEST_MINI1155_DEPLOY_RARE_PROBABLITY_PERCENTAGE || 1,
        maxPerMint: process.env.TEST_MINI1155_DEPLOY_MAX_PER_MINT || 10,
        // standard token configuration
        s: {
          tokenId: process.env.TEST_MINI1155_DEPLOY_STANDARD_TOKEN_ID || 1,
          maxSupply: process.env.TEST_MINI1155_DEPLOY_STANDARD_TOKEN_MAX_SUPPLY || 770,
          personalCap: process.env.TEST_MINI1155_DEPLOY_STANDARD_TOKEN_PERSONAL_CAP || 10
        },
        // rare token configuration
        r: {
          tokenId: process.env.TEST_MINI1155_DEPLOY_RARE_TOKEN_ID || 2,
          maxSupply: process.env.TEST_MINI1155_DEPLOY_RARE_TOKEN_MAX_SUPPLY || 7, // will be 84 after Sale
          personalCap: process.env.TEST_MINI1155_DEPLOY_RARE_TOKEN_PERSONAL_CAP || 1
        }
      }
    }
  }
}
