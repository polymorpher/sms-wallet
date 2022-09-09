import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
// import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments
  const { deployer, operatorA } = await getNamedAccounts()
  const chainId = await getChainId()

  console.log(`chainId: ${chainId}`)

  const deployedMiniID = await deploy('MiniID', {
    contract: 'MiniID',
    from: deployer,
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}'],
      execute: {
        init: {
          methodName: 'initialize',
          args: []
        }
      }
    },
    log: true
  })

  const miniID = await hre.ethers.getContractAt('MiniID', deployedMiniID.address)

  console.log('MiniID deployed to  :', miniID.address)
  console.log('MiniID Name         : ', await miniID.name())
  console.log('MiniID Symbol       : ', await miniID.symbol())
  // Mint test tokens
  if (chainId !== '1666600000,') {
    miniID.connect(operatorA)
    // TODO republish metadata without .json suffix and replace 'n.json' with ''
    await miniID.safeMint(config.test.operator, config.test.miniID.baseUri + '0.json')
    await miniID.safeMint(config.test.user, '1.json')
    await miniID.safeMint(config.test.creator, '2.json')
    console.log(`Token 0 Owner: ${await miniID.ownerOf(0)}`)
    console.log(`Token 1 Owner: ${await miniID.ownerOf(1)}`)
    console.log(`Token 2 Owner: ${await miniID.ownerOf(2)}`)
    console.log(`Token 0 URI  : ${await miniID.tokenURI(0)}`)
    console.log(`Token 1 URI  : ${await miniID.tokenURI(1)}`)
    console.log(`Token 2 URI  : ${await miniID.tokenURI(2)}`)
  }
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniID', '004', 'deploy']
export default deployFunction
