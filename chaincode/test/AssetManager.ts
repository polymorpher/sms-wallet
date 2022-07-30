import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import {
  prepare,
  deploy,
  checkBalance,
  checkContractBalance,
  getBigNumber,
} from "./utilities";
const { BigNumber } = require("ethers");
const Constants = require("./utilities/constants");

const ONE_ETH = ethers.utils.parseEther("1");

let snapshotId: string;

describe("AssetManager", function (this) {
  before(async function (this) {
    await prepare(this, ["AssetManager", "ERC20Mock"]);
  });

  beforeEach(async function (this) {
    this.snapshotId = await waffle.provider.send("evm_snapshot", []);
    await deploy(this, [["assetManager", this.AssetManager, []]]);
  });

  afterEach(async function (this) {
    await waffle.provider.send("evm_revert", [this.snapshotId]);
  });

  describe("checkAssetManager", function () {
    it("Positive walkthrough, deposit, withdraw, authorize, send", async function () {
      const provider = waffle.provider;

      // check Initial Balance
      await checkBalance(this.alice, "10000");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "0");

      let tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH,
      });
      await tx.wait();

      await checkBalance(this.alice, "9998.999919798403062629");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(
        await this.assetManager.getUserBalance(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));
      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));

      tx = await this.assetManager.connect(this.alice).authorize(ONE_ETH);
      // wait until the transaction is mined
      await tx.wait();
      await checkBalance(this.alice, "9998.999838578338450628");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(
        await this.assetManager.getUserBalance(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));
      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      tx = await this.assetManager.connect(this.alice).withdraw(0);
      await tx.wait();
      await checkBalance(this.alice, "9999.999782301289414870");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "0");

      expect(
        await this.assetManager.getUserBalance(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));
      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));

      tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH,
      });
      await tx.wait();
      tx = await this.assetManager.connect(this.alice).authorize(ONE_ETH);
      await tx.wait();
      // wait until the transaction is mined
      await checkBalance(this.alice, "9998.999643153536715376");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(
        await this.assetManager.getUserBalance(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));
      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      tx = await this.assetManager.send(
        ONE_ETH,
        this.alice.address,
        this.bob.address
      );
      await tx.wait();
      await checkBalance(this.alice, "9998.999643153536715376");
      await checkBalance(this.bob, "10001");
      await checkContractBalance(provider, this.assetManager, "0");

      expect(
        await this.assetManager.getUserBalance(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));
      expect(
        await this.assetManager.getUserAuthorization(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));
    });

    it("checkTransferERC20", async function () {
      await deploy(this, [
        ["erc20", this.ERC20Mock, ["Mock20", "M20", getBigNumber("10000000")]],
      ]);

      // transfer 100 M20 to alice
      let tx = await this.erc20.transfer(
        this.alice.address,
        BigNumber.from("100")
      );
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      );
      // alice approves 70 to Asset Manager
      tx = await this.erc20
        .connect(this.alice)
        .increaseAllowance(this.deployer.address, BigNumber.from("70"));
      await tx.wait();
      console.log(
        `AliceDeployerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.deployer.address
        )}`
      );
      tx = await this.erc20.transferFrom(
        this.alice.address,
        this.bob.address,
        BigNumber.from("3")
      );
      await tx.wait();
      console.log(
        `AliceDeployerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.deployer.address
        )}`
      );
      // Deployer Sends 50 to Bob
      tx = await this.assetManager
        .connect(this.deployer)
        .transfer(
          BigNumber.from("3"),
          Constants.TokenType.ERC20,
          0,
          this.erc20.address,
          this.alice.address,
          this.bob.address
        );
      await tx.wait();
      //   // check alices and bobs balance
    });

    it("checkTransferERC721", async function () {});
    it("checkTransferERC1155", async function () {});
    it("checkEvents", async function () {});
    it("checkReverts", async function () {});
  });
});
