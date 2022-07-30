import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import Mocha from "mocha";
import { MockProvider } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
const { BigNumber } = require("ethers");

export const BASE_TEN = 10;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// const {
//   ethers: {
//     constants: { MaxUint256 },
//   },
// } = require("ethers");
export async function prepare(thisObject: Mocha.Context, contracts: string[]) {
  for (const i in contracts) {
    const contract = contracts[i];
    thisObject[contract] = await ethers.getContractFactory(contract);
  }
  thisObject.signers = await ethers.getSigners();
  thisObject.deployer = thisObject.signers[0];
  thisObject.administrator = thisObject.signers[1];
  thisObject.alice = thisObject.signers[2];
  thisObject.bob = thisObject.signers[3];
  thisObject.carol = thisObject.signers[4];
}

export async function deploy(thisObject: Mocha.Context, contracts: any[][]) {
  for (const i in contracts) {
    const contract = contracts[i];
    thisObject[contract[0]] = await contract[1].deploy(...(contract[2] || []));
    await thisObject[contract[0]].deployed();
  }
}

export async function checkBalance(
  account: SignerWithAddress,
  balance: string
) {
  const accountBalance = BigNumber.from(await account.getBalance()).toString();
  expect(accountBalance).to.equal(ethers.utils.parseEther(balance).toString());
}

export async function checkContractBalance(
  provider: MockProvider,
  contract: Contract,
  balance: string
) {
  const contractBalance = BigNumber.from(
    await provider.getBalance(contract.address)
  ).toString();
  expect(contractBalance).to.equal(ethers.utils.parseEther(balance).toString());
}

export function getBigNumber(amount: string, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
}
