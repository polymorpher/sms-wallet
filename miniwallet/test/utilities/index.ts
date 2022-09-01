import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { MockProvider } from 'ethereum-waffle'
import { Contract, BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import Mocha from 'mocha'

export const BASE_TEN = 10

export async function prepare (thisObject: Mocha.Context, contracts: string[]) {
  for (const i in contracts) {
    const contract = contracts[i]
    thisObject[contract] = await ethers.getContractFactory(contract)
  }
  thisObject.signers = await ethers.getSigners()
  thisObject.deployer = thisObject.signers[0]
  thisObject.operatorA = thisObject.signers[1]
  thisObject.operatorB = thisObject.signers[2]
  thisObject.operatorC = thisObject.signers[3]
  thisObject.alice = thisObject.signers[4]
  thisObject.bob = thisObject.signers[5]
  thisObject.carol = thisObject.signers[6]
  thisObject.dora = thisObject.signers[7]
  thisObject.ernie = thisObject.signers[8]
}

export async function deploy (context, contracts) {
  for (const contract of contracts) {
    context[contract[0]] = await contract[1].deploy(...(contract[2] || []))
    await context[contract[0]].deployed()
  }
}

export async function deployUpgradeable (thisObject, contracts) {
  for (const contract of contracts) {
    thisObject[contract[0]] = await contract[1].deploy()
    await thisObject[contract[0]].deployed()
    const tx = await thisObject[contract[0]].initialize(...(contract[2] || []))
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
