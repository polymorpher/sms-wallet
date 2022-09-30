import config from '../config'
import { ethers } from 'hardhat'
import { promises as fs, existsSync, mkdirSync } from 'fs'
import path from 'path'

export async function isDeployed (hre, contractName) {
  // If we don't save deployments (e.g. for local networks) deployed = false
  if (!hre.network.saveDeployments) {
    return false
  }
  try {
    if (!existsSync(contractName)) {
      return false
    }
    const contractArtifact = await hre.deployments.getExtendedArtifact(contractName)
    const currentDeployment = JSON.parse(await fs.readFile(path.join(config.artifactsDirectory, hre.network.name, `${contractName}.json`), { encoding: 'utf-8' }))
    for (const implementation of currentDeployment.contract.implementations) {
      if (implementation.bytecodeHash === ethers.utils.id(contractArtifact.bytecode)) {
        console.log(`Have already deployed this version of ${contractName}`)
        console.log(`Current Deployment: ${JSON.stringify(currentDeployment)}`)
        return true
      }
    }
    console.log(`Have already deployed another version of ${contractName}`)
    console.log(`Current Deployment: ${JSON.stringify(currentDeployment)}`)
    return false
  } catch (ex) {
    console.error('Unexpected error reading deployment file')
    console.error(ex)
    // eslint-disable-next-line no-process-exit
    process.exit(2)
  }
}

export async function persistDeployment (hre, contractName, contractAddress, proxyName, proxyAddress) {
  const artifactsDirectory = path.join(config.artifactsDirectory, hre.network.name)
  const contractArtifact = await hre.deployments.getExtendedArtifact(contractName)
  const proxyArtifact = await hre.deployments.getExtendedArtifact(proxyName)
  const miniWalletArtifact = {
    contract: {
      name: contractName,
      network: hre.network.name,
      implementations: [
        {
          name: contractName,
          version: 1, // TODO: auto-increment
          address: contractAddress,
          bytecodeHash: ethers.utils.id(contractArtifact.bytecode || '')
        }
      ],
      proxyContract: {
        name: proxyName,
        address: proxyAddress,
        bytecodeHash: ethers.utils.id(proxyArtifact.bytecode || '')
      }
    }
  }
  if (hre.network.saveDeployments) {
    console.log(`Saving miniWalletArtifact: ${JSON.stringify(miniWalletArtifact)}`)
    mkdirSync(artifactsDirectory, { recursive: true })
    await fs.writeFile(path.join(artifactsDirectory, `${contractName}.json`), JSON.stringify(miniWalletArtifact), { encoding: 'utf-8' })
  }
}
