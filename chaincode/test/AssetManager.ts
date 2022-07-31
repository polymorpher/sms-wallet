import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import {
  prepare,
  deploy,
  checkBalance,
  checkContractBalance,
  getBigNumber,
} from "./utilities";
import { range, cloneDeep } from "lodash";
const { BigNumber } = require("ethers");
const Constants = require("./utilities/constants");

const ONE_ETH = ethers.utils.parseEther("1");
const DUMMY_HEX = "0x";

// let snapshotId: string;

describe("AssetManager", function (this) {
  before(async function (this) {
    await prepare(this, [
      "AssetManager",
      "TestERC20",
      "TestERC721",
      "TestERC1155",
    ]);
  });

  beforeEach(async function (this) {
    this.snapshotId = await waffle.provider.send("evm_snapshot", []);
    await deploy(this, [
      ["assetManager", this.AssetManager, [this.operator.address]],
    ]);
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

      await checkBalance(this.alice, "9998.999919483524845500");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(await this.assetManager.userBalances(this.alice.address)).to.equal(
        ethers.utils.parseEther("1.0")
      );
      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));

      tx = await this.assetManager.connect(this.alice).authorize(ONE_ETH);
      // wait until the transaction is mined
      await tx.wait();
      await checkBalance(this.alice, "9998.999838223658270584");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(await this.assetManager.userBalances(this.alice.address)).to.equal(
        ethers.utils.parseEther("1.0")
      );
      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      tx = await this.assetManager.connect(this.alice).withdraw(0);
      await tx.wait();
      await checkBalance(this.alice, "9999.999781782535464824");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "0");

      expect(await this.assetManager.userBalances(this.alice.address)).to.equal(
        ethers.utils.parseEther("0.0")
      );
      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));

      tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH,
      });
      await tx.wait();
      tx = await this.assetManager.connect(this.alice).authorize(ONE_ETH);
      await tx.wait();
      // wait until the transaction is mined
      await checkBalance(this.alice, "9998.999642386641966537");
      await checkBalance(this.bob, "10000");
      await checkContractBalance(provider, this.assetManager, "1");

      expect(await this.assetManager.userBalances(this.alice.address)).to.equal(
        ethers.utils.parseEther("1.0")
      );
      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("1.0"));

      tx = await this.assetManager
        .connect(this.operator)
        .send(ONE_ETH, this.alice.address, this.bob.address);
      await tx.wait();
      await checkBalance(this.alice, "9998.999642386641966537");
      await checkBalance(this.bob, "10001");
      await checkContractBalance(provider, this.assetManager, "0");

      expect(await this.assetManager.userBalances(this.alice.address)).to.equal(
        ethers.utils.parseEther("0.0")
      );
      expect(
        await this.assetManager.userAuthorizations(this.alice.address)
      ).to.equal(ethers.utils.parseEther("0.0"));
    });

    it("checkTransferERC20", async function () {
      await deploy(this, [
        ["erc20", this.TestERC20, [getBigNumber("10000000")]],
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
        .increaseAllowance(this.assetManager.address, BigNumber.from("70"));
      await tx.wait();
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      );
      //   tx = await this.erc20
      //     .connect(this.operator)
      //     .transferFrom(
      //       this.alice.address,
      //       this.bob.address,
      //       BigNumber.from("3")
      //     );
      //   await tx.wait();
      //   console.log(
      //     `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      //   );
      //   console.log(
      //     `AliceOperatorAllowance: ${await this.erc20.allowance(
      //       this.alice.address,
      //       this.operator.address
      //     )}`
      //   );
      tx = await this.erc20
        .connect(this.alice)
        .transfer(this.bob.address, BigNumber.from("3"));
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      );
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      );
      // Operator Sends 3 to Bob
      tx = await this.assetManager
        .connect(this.operator)
        .transfer(
          BigNumber.from("3"),
          Constants.TokenType.ERC20,
          0,
          this.erc20.address,
          this.alice.address,
          this.bob.address
        );
      await tx.wait();
      // check alices and bobs balance
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      );
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      );
    });

    it("checkTransferERC721", async function () {
      // Deploy 721
      await deploy(this, [
        [
          "erc721",
          this.TestERC721,
          [range(10), range(10).map((e: any) => `ipfs://test721/${e}`)],
        ],
      ]);
      console.log(`erc721.address: ${this.erc721.address}`);
      // Transfer some Tokens for Alice
      let tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        0
      );
      await tx.wait();
      tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        1
      );
      await tx.wait();
      tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        2
      );
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc721.balanceOf(this.alice.address)}`
      );
      // Alice Approves the AssetManager for the Token
      tx = await this.erc721
        .connect(this.alice)
        .approve(this.assetManager.address, 0);
      await tx.wait();
      // Operator sends the tokens for Alice to Bob
      tx = await this.assetManager
        .connect(this.operator)
        .transfer(
          BigNumber.from("1"),
          Constants.TokenType.ERC721,
          0,
          this.erc721.address,
          this.alice.address,
          this.bob.address
        );
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc721.balanceOf(this.alice.address)}`
      );
      console.log(
        `BobBalance: ${await this.erc721.balanceOf(this.bob.address)}`
      );
    });
    it("checkTransferERC1155", async function () {
      // Deploy 1155
      await deploy(this, [
        [
          "erc1155",
          this.TestERC1155,
          [
            range(10),
            range(10).map((e: any) => 10), // mint 10 for each
            range(10).map((e: any) => `ipfs://test1155/${e}`),
          ],
        ],
      ]);
      console.log(`erc1155.address: ${this.erc1155.address}`);
      // Transfer some Tokens for Alice
      let tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        0,
        7,
        DUMMY_HEX
      );
      await tx.wait();
      tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        1,
        7,
        DUMMY_HEX
      );
      await tx.wait();
      tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        2,
        7,
        DUMMY_HEX
      );
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc1155.balanceOf(this.alice.address, 0)}`
      );
      // Alice Approves the AssetManager for the Token
      tx = await this.erc1155
        .connect(this.alice)
        .setApprovalForAll(this.assetManager.address, true);
      await tx.wait();
      // Operator sends the tokens for Alice to Bob
      tx = await this.assetManager
        .connect(this.operator)
        .transfer(
          BigNumber.from("3"),
          Constants.TokenType.ERC1155,
          0,
          this.erc1155.address,
          this.alice.address,
          this.bob.address
        );
      await tx.wait();
      console.log(
        `AliceBalance: ${await this.erc1155.balanceOf(this.alice.address, 0)}`
      );
      console.log(
        `BobBalance: ${await this.erc1155.balanceOf(this.bob.address, 0)}`
      );
    });
    it("checkEvents", async function () {});
    it("checkReverts", async function () {});
  });
});
