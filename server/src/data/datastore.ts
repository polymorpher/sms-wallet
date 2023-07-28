import { type ChildProcessWithoutNullStreams, spawn } from 'child_process'
import config from '../../config.ts'
import { Datastore } from '@google-cloud/datastore'

const dsArgs = `beta emulators datastore start --host-port=127.0.0.1:${config.datastore.mockPort}`.split(' ')

let dsClient: Datastore
let server: ChildProcessWithoutNullStreams | undefined

export function shut (): void {
  if (!server) {
    return
  }
  process.kill(-(server.pid ?? 1))
  server = undefined
}

export function mock (): void {
  if (!server) {
    server = spawn('gcloud', dsArgs)
    const handler = (data: any): void => {
      // console.log(data.toString());
      if (data?.includes('Dev App Server is now running')) {
        console.log('Mock DS started!')
      }
    }
    server.stdout.on('data', handler)
    server.stderr.on('data', handler)
    server.on('close', data => { console.log('Mock DS is shutting down. If this is unintended please run cmd manually to debug') })
    server.on('error', err => { console.log(`Mock DS error: ${err}`) })
    process.on('exit', module.exports.shut)
    process.on('uncaughtException', err => {
      console.error(`UncaughtException [${err}].`)
      shut()
    })
  }
}

export function client (): Datastore {
  if (dsClient) {
    return dsClient
  }
  const clientConf = {
    projectId: config.datastore.cred.project_id ?? 'mock',
    credentials: config.datastore.cred,
    namespace: config.datastore.namespace,
    apiEndpoint: config.datastore.mock ? `127.0.0.1:${config.datastore.mockPort}` : undefined
  }

  if (config.datastore.mock) {
    mock()
  }

  console.log(`constructing datastore client: projectId=${clientConf.projectId}, namespace=${clientConf.namespace}, apiEndPoint=${clientConf.apiEndpoint ?? 'GCP'}`)
  dsClient = new Datastore(clientConf)
  return dsClient
}
