import { ethers } from 'hardhat'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export function encodeParameters (types, values) {
  const abi = new ethers.utils.AbiCoder()
  return abi.encode(types, values)
};

export async function prepare721 (testEnvironment, contracts) {
  for (const i in contracts) {
    const contract = contracts[i]
    testEnvironment[contract] = await ethers.getContractFactory(contract)
  }
  testEnvironment.signers = await ethers.getSigners()
  testEnvironment.alice = testEnvironment.signers[0]
  testEnvironment.bob = testEnvironment.signers[1]
  testEnvironment.carol = testEnvironment.signers[2]
  testEnvironment.dev = testEnvironment.signers[3]
  testEnvironment.Mini721 = await ethers.getContractFactory('Mini721')
}

export async function deploy721 (testEnvironment, contracts) {
  for (const contract of contracts) {
    testEnvironment[contract[0]] = await contract[1].deploy(...(contract[2] || []))
    await testEnvironment[contract[0]].deployed()
  }
}

export async function userMint721 (testEnvironment, minter, numTokens) {
  const mintPrice = await testEnvironment.mini721.mintPrice()
  return await testEnvironment.mini721.connect(minter).mintMini(numTokens, {
    value: mintPrice.mul(numTokens)
  })
}

export async function communityMint721 (testEnvironment, owner, numTokens) {
  return await testEnvironment.mini721.mintForCommunity(owner, numTokens)
}
