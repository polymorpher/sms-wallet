import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { MockProvider } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
const { BigNumber } = require("ethers");
// const {
//   ethers: {
//     constants: { MaxUint256 },
//   },
// } = require("ethers");

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
