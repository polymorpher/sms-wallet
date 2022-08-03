/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";

const config = require("../config.js");

const INITIAL_AUTH_LIMIT = ethers.utils.parseEther("100000");

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  console.log("operators:", JSON.stringify(config.operators));

  const AssetManager = await ethers.getContractFactory("AssetManager");
  const assetManager = await upgrades.deployProxy(
    AssetManager,
    [config.initialOperatorThreshold, config.operators, INITIAL_AUTH_LIMIT],
    { initializer: "initialize", unsafeAllow: ["external-library-linking"] }
  );

  await assetManager.deployed();
  console.log("AssetManager deployed to:", assetManager.address);
  console.log(
    "AssetManager Operator Threshold:",
    await assetManager.operatorThreshold()
  );

  // TODO Display operators on deploy
  //   const operatorCount = await assetManager.getRoleMemberCount("OPERATOR_ROLE");

  //   const operators = [];
  //   for (let i = 0; i < operatorCount; ++i) {
  //     operators.push(await assetManager.getRoleMember("OPERATOR_ROLE", i));
  //   }

  const globalUserAuthLimit = await assetManager.globalUserAuthLimit();
  console.log(
    "AssetManager Global User Auth Limit:",
    ethers.utils.formatUnits(globalUserAuthLimit.toString())
  );
};
deployFunction.dependencies = [];
deployFunction.tags = ["AssetManager"];
export default deployFunction;
