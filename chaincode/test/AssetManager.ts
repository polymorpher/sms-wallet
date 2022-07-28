import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import { checkBalance, checkContractBalance } from "./utilities";
const { BigNumber } = require("ethers");

describe("AssetManager", function () {
  it("Positive walkthrough, deposit, withdraw, authorize, send", async function () {
    const provider = waffle.provider;
    const signers = await ethers.getSigners();
    // const deployer = signers[0];
    // const administrator = signers[1];
    const alice = signers[2];
    const bob = signers[3];
    // const carol = signers[4];

    const ONE_ETH = ethers.utils.parseEther("1");

    const AssetManager = await ethers.getContractFactory("AssetManager");
    const assetManager = await AssetManager.deploy();
    await assetManager.deployed();

    await checkBalance(alice, "10000");
    await checkBalance(bob, "10000");
    await checkContractBalance(provider, assetManager, "0");

    let tx = await assetManager.connect(alice).deposit({
      value: ONE_ETH,
    });
    // wait until the transaction is mined
    await tx.wait();

    await checkBalance(alice, "9998.999919798403062629");
    await checkBalance(bob, "10000");
    await checkContractBalance(provider, assetManager, "1");

    expect(await assetManager.getUserBalance(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );
    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );

    tx = await assetManager.connect(alice).authorize(ONE_ETH);
    // wait until the transaction is mined
    await tx.wait();
    await checkBalance(alice, "9998.999838578338450628");
    await checkBalance(bob, "10000");
    await checkContractBalance(provider, assetManager, "1");

    expect(await assetManager.getUserBalance(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );
    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );

    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );

    tx = await assetManager.connect(alice).withdraw(0);
    await tx.wait();
    await checkBalance(alice, "9999.999782301289414870");
    await checkBalance(bob, "10000");
    await checkContractBalance(provider, assetManager, "0");

    expect(await assetManager.getUserBalance(alice.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );
    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );

    tx = await assetManager.connect(alice).deposit({
      value: ONE_ETH,
    });
    await tx.wait();
    tx = await assetManager.connect(alice).authorize(ONE_ETH);
    await tx.wait();
    // wait until the transaction is mined
    await checkBalance(alice, "9998.999643153536715376");
    await checkBalance(bob, "10000");
    await checkContractBalance(provider, assetManager, "1");

    expect(await assetManager.getUserBalance(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );
    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );

    tx = await assetManager.send(ONE_ETH, alice.address, bob.address);
    await tx.wait();
    await checkBalance(alice, "9998.999643153536715376");
    await checkBalance(bob, "10001");
    await checkContractBalance(provider, assetManager, "0");

    expect(await assetManager.getUserBalance(alice.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );
    expect(await assetManager.getUserAuthorization(alice.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );
  });
});
