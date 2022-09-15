import * as fs from 'fs'
import * as path from 'path'

export async function getConfig (networkName, configID) {
// Get the deployment configuration
// If a network specific config exists use that otherwise use the default
  console.log(`Deploying to network: ${networkName}`)
  let configPath = path.join(__dirname, './' + configID + '_' + networkName + '.ts')
  let config
  if (fs.existsSync(configPath)) {
    configPath = configPath.substring(0, configPath.length - 3)
    const { default: configNetwork } = await import(configPath)
    config = configNetwork
  } else {
    configPath = path.join(__dirname, './' + configID + '.ts')
    if (fs.existsSync(configPath)) {
    //   console.log(`getConfig configPath: ${configPath}`)
      configPath = configPath.substring(0, configPath.length - 3)
      const { default: configDefault } = await import(configPath)
      //   console.log(`getConfig configDefault: ${JSON.stringify(configDefault)}`)
      config = configDefault
    }
  }
  return config
}
