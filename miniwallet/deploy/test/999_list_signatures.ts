import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
const ContractPath = '../../build/contracts/miniWallet/miniWallet.sol/MiniWallet.json'
// const ContractPath = '../../build/contracts/mocks/Mock721.sol/Mock721.json'
const ContractJSON = require(ContractPath)
const { abi: ABI } = ContractJSON
// const Mock721Initialize = '0x8129fc1c'

const listFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const contractInterface = new ethers.utils.Interface(ABI)
  //   console.log(`Interface: ${JSON.stringify(contractInterface)}`)
  for (const fragment of contractInterface.fragments) {
    if (fragment.type === 'function') {
      console.log(`fragment name: ${fragment.name}`)
      console.log(`fragment parameters: ${fragment.format()}`)
      try {
        console.log(`fragment sighash: ${contractInterface.getSighash(fragment.name)}`)
      } catch (ex) {
        console.log(`Error displaying signature for: ${fragment.name}, ${fragment.format()}`)
        console.error(ex)
      }
    }
  }
}

listFunction.dependencies = []
listFunction.tags = ['ListSignatures']
export default listFunction
