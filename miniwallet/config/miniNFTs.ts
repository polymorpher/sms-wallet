import * as dotenv from 'dotenv'
import * as path from 'path'
const envPath = path.join(__dirname, '../env/miniNFTs.env')
dotenv.config({ path: envPath })

export default {
  mini721: {
    saleIsActive: process.env.MINI721_DEPLOY_SALES_IS_ACTIVE === '1' || process.env.MINI721_DEPLOY_SALES_IS_ACTIVE === 'true',
    metadataFrozen: process.env.MINI721_DEPLOY_METADATA_FROZEN === '1' || process.env.MINI721_DEPLOY_METADATA_FROZEN === 'true',
    provenanceFrozen: process.env.MINI721_DEPLOY_PROVENANCE_FROZEN === '1' || process.env.MINI721_DEPLOY_PROVENANCE_FROZEN === 'true',
    max721Tokens: process.env.MINI721_DEPLOY_MAX721_TOKENS || 1000000000000,
    mintPrice: process.env.MINI721_DEPLOY_MINT_PRICE || '000000000000000000',
    maxPerMint: process.env.MINI721_DEPLOY_MAX_PER_MINT || 1,
    baseUri: process.env.MINI721_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
    contractUri: process.env.MINI721_DEPLOY_CONTRACT_URI || 'ipfs://Qmezo5wDKz7kH'
  },
  mini1155: {
    collection1: {
      revenueAccount: process.env.MINI1155_COLLECTION1_REVENUE_ACCOUNT || 'badAddress',
      maxPerMint: process.env.MINI1155_COLLECTION1_MAX_PER_MINT || 10,
      mintPrice: process.env.MINI1155_COLLECTION1_MINT_PRICE || '420000000000000000',
      exchangeRatio: process.env.MINI1155_COLLECTION1_EXCHANGE_RATIO || 0,
      rareProbabilityPercentage: process.env.MINI1155_COLLECTION1_RARE_PROBABLITY_PERCENTAGE || 1,
      // standard token configuration
      s: {
        tokenId: process.env.MINI1155_COLLECTION1_STANDARD_TOKEN_ID || 1,
        maxSupply: process.env.MINI1155_COLLECTION1_STANDARD_TOKEN_MAX_SUPPLY || 770,
        personalCap: process.env.MINI1155_COLLECTION1_STANDARD_TOKEN_PERSONAL_CAP || 10
      },
      // rare token configuration
      r: {
        tokenId: process.env.MINI1155_COLLECTION1_RARE_TOKEN_ID || 2,
        maxSupply: process.env.MINI1155_COLLECTION1_RARE_TOKEN_MAX_SUPPLY || 7, // will be 84 after Sale
        personalCap: process.env.MINI1155_COLLECTION1_RARE_TOKEN_PERSONAL_CAP || 1
      }
    },
    collection2: {
      revenueAccount: process.env.MINI1155_COLLECTION2_REVENUE_ACCOUNT || 'badAddress',
      maxPerMint: process.env.MINI1155_COLLECTION2_MAX_PER_MINT || 20,
      mintPrice: process.env.MINI1155_COLLECTION2_MINT_PRICE || '840000000000000000',
      exchangeRatio: process.env.MINI1155_COLLECTION2_EXCHANGE_RATIO || 0,
      rareProbabilityPercentage: process.env.MINI1155_COLLECTION2_RARE_PROBABLITY_PERCENTAGE || 2,
      // standard token configuration
      s: {
        tokenId: process.env.MINI1155_COLLECTION2_STANDARD_TOKEN_ID || 3,
        maxSupply: process.env.MINI1155_COLLECTION2_STANDARD_TOKEN_MAX_SUPPLY || 1540,
        personalCap: process.env.MINI1155_COLLECTION2_STANDARD_TOKEN_PERSONAL_CAP || 20
      },
      // rare token configuration
      r: {
        tokenId: process.env.MINI1155_COLLECTION2_RARE_TOKEN_ID || 4,
        maxSupply: process.env.MINI1155_COLLECTION2_RARE_TOKEN_MAX_SUPPLY || 28, // will be 84 after Sale
        personalCap: process.env.MINI1155_COLLECTION2_RARE_TOKEN_PERSONAL_CAP || 2
      }
    },
    deploy: {
      name: process.env.MINI1155_DEPLOY_NAME || 'MiniWallet',
      symbol: process.env.MINI1155_DEPLOY_SYMBOL || 'Mini1155',
      salt: process.env.MINI1155_DEPLOY_SALT || '0x3100000000000000000000000000000000000000000000000000000000000000',
      baseUri: process.env.MINI1155_DEPLOY_BASE_URI || 'ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/',
      contractUri: process.env.MINI1155_DEPLOY_CONTRACT_URI || 'ipfs://QmdKB6d1zT7R8dNmEQzc6N1m5p2LDJZ66Hzu8F4fGhdVrq',
      revenueAccount: process.env.MINI1155_DEPLOY_REVENUE_ACCOUNT,
      saleIsActive: process.env.MINI1155_DEPLOY_SALE_IS_ACTIVE === 'true' || process.env.MINI1155_DEPLOY_SALE_IS_ACTIVE === '1',
      metadataFrozen: process.env.MINI1155_DEPLOY_METADATA_FROZEN === 'true' || process.env.MINI1155_DEPLOY_METADATA_FROZEN === '1',
      mintPrice: process.env.MINI1155_DEPLOY_MINT_PRICE || '000000000000000000',
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
}
