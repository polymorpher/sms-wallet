import config from '../config'
import { ethers } from 'hardhat'
import { promises as fs, constants as fsConstants, existsSync, mkdirSync } from 'fs'
import path from 'path'

export const BASE_TEN = 10

export async function checkDeployed (hre, contract) {
  // If we don't save deployments (e.g. for local networks) deployed = fals
  if (!hre.network.saveDeployments) { return false }
  const artifactsDirectory = config.artifactsDirectory + hre.network.name + '/'
  const artifactName = 'MiniWallet'
  const artifactFile = artifactsDirectory + artifactName + '.json'
  try {
    if (!existsSync(artifactFile)) {
      return false
    }
    const contractArtifact = await hre.deployments.getExtendedArtifact(contract)
    const currentDeployment = JSON.parse(await fs.readFile(artifactFile, { encoding: 'utf-8' }))
    for (const implementation of currentDeployment.contract.implementations) {
      if (implementation.bytecodeHash === ethers.utils.id(contractArtifact.bytecode)) {
        console.log(`Have already deployed this version of ${artifactName}`)
        console.log(`Current Deployment: ${JSON.stringify(currentDeployment)}`)
        return true
      }
    }
    console.log(`Have already deployed another version of ${artifactName}`)
    console.log(`Current Deployment: ${JSON.stringify(currentDeployment)}`)
    return false
  } catch (ex) {
    console.error('Unexpected error reading deployment file')
    console.error(ex)
    // eslint-disable-next-line no-process-exit
    process.exit(2)
  }
}

export async function persistDeployment (hre, contract, contractAddress, proxy, proxyAddress) {
  const saveArtifacts = hre.network.saveDeployments
  const artifactsDirectory = config.artifactsDirectory + hre.network.name + '/'
  const artifactName = 'MiniWallet'
  const artifactFile = artifactsDirectory + artifactName + '.json'
  // Persist Contract Information
  const contractArtifact = await hre.deployments.getExtendedArtifact(contract)
  //   console.log(`miniWalletImplementation: ${JSON.stringify(miniWalletImplementationArtifact)}`)
  const proxyArtifact = await hre.deployments.getExtendedArtifact(proxy)
  //   console.log(`miniWalletImplementation: ${JSON.stringify(miniProxyArtifact)}`)
  const miniWalletArtifact = {
    contract: {
      name: 'MiniWallet',
      network: hre.network.name,
      implementations: [
        {
          name: 'MiniWallet',
          version: 1,
          address: contractAddress,
          bytecodeHash: ethers.utils.id(contractArtifact.bytecode || '')
        }
      ],
      proxyContract: {
        name: 'MiniProxy',
        address: proxyAddress,
        bytecodeHash: ethers.utils.id(proxyArtifact.bytecode || '')
      }
    }
  }
  console.log(`MiniWalletArtifact: ${JSON.stringify(miniWalletArtifact)}`)
  if (saveArtifacts) {
    if (!existsSync(artifactsDirectory)) {
      mkdirSync(artifactsDirectory, { recursive: true })
    }
    await fs.writeFile(artifactFile, JSON.stringify(miniWalletArtifact), { encoding: 'utf-8' })
  }
}
