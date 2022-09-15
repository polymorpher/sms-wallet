import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { MockProvider } from 'ethereum-waffle'
import { Contract, BigNumber } from 'ethers'
import { ethers } from 'hardhat'

export const BASE_TEN = 10

export async function prepare (testEnvironment, contracts) {
  for (const i in contracts) {
    const contract = contracts[i]
    testEnvironment[contract] = await ethers.getContractFactory(contract)
  }
  testEnvironment.signers = await ethers.getSigners()
  testEnvironment.deployer = testEnvironment.signers[0]
  testEnvironment.operatorA = testEnvironment.signers[1]
  testEnvironment.operatorB = testEnvironment.signers[2]
  testEnvironment.operatorC = testEnvironment.signers[3]
  testEnvironment.alice = testEnvironment.signers[4]
  testEnvironment.bob = testEnvironment.signers[5]
  testEnvironment.carol = testEnvironment.signers[6]
  testEnvironment.dora = testEnvironment.signers[7]
  testEnvironment.ernie = testEnvironment.signers[8]
}

export async function deploy (context, contracts) {
  for (const contract of contracts) {
    context[contract[0]] = await contract[1].deploy(...(contract[2] || []))
    await context[contract[0]].deployed()
  }
}

export async function deployUpgradeable (testEnvironment, contracts) {
  for (const contract of contracts) {
    testEnvironment[contract[0]] = await contract[1].deploy()
    await testEnvironment[contract[0]].deployed()
    const tx = await testEnvironment[contract[0]].initialize(...(contract[2] || []))
    await tx.wait()
    // await ethers.provider.waitForTransaction(tx.hash)
  }
}

export async function getTxCost (txHash: string | Promise<string>) {
  const receipt = await ethers.provider.getTransactionReceipt(txHash)
  return BigNumber.from(receipt.effectiveGasPrice.mul(receipt.gasUsed))
}

export async function checkBalance (
  account: SignerWithAddress,
  balance: string
) {
  const accountBalance = BigNumber.from(await account.getBalance()).toString()
  expect(accountBalance).to.equal(ethers.utils.parseEther(balance).toString())
}

export async function checkContractBalance (
  provider: MockProvider,
  contract: Contract,
  balance: string
) {
  const contractBalance = BigNumber.from(
    await provider.getBalance(contract.address)
  ).toString()
  expect(contractBalance).to.equal(ethers.utils.parseEther(balance).toString())
}

export function getBigNumber (amount: string, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals))
}

export * from './Mini721Util'
export * from './Mini1155Util'
