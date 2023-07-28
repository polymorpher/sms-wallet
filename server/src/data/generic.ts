import { client } from './datastore.ts'
import appConfig from '../../config.ts'
import lodash from 'lodash-es'
import { type Key } from '@google-cloud/datastore'

const ds = client()

const mergeNonEmpty = (a: any, b: any): any => {
  return lodash.mergeWith(a, b, (original, newValue) => {
    if (lodash.isUndefined(newValue) || lodash.isNull(newValue) || lodash.isNaN(newValue)) {
      return original
    }
    return undefined
  })
}

export const GenericBuilder = (inKind): any => {
  const kind = appConfig.debug ? `${inKind}_dev` : `${inKind}`
  const get = async (id): Promise<any> => {
    if (!id) {
      return await Promise.resolve(null)
    }
    const key = ds.key([kind, id])
    return await new Promise((resolve, reject) => {
      ds.get(key, async (err, project) => {
        if (err) {
          reject(err); return
        }
        if (!project) {
          resolve(null); return
        }

        resolve(project)
      })
    })
  }
  const find = async (...predicates): Promise<any> => {
    let query = ds.createQuery(kind)
    predicates.filter(e => e).forEach(p => {
      if (lodash.isArray(p)) {
        const [field, value] = p
        query = query.filter(field, value)
      } else {
        const { field, operator, value } = p
        if (operator) {
          query = query.filter(field, operator, value)
        } else {
          query = query.filter(field, value)
        }
      }
    })
    return await new Promise((resolve, reject) => {
      ds.runQuery(query, (err, entities) => {
        if (err) {
          reject(err); return
        }
        resolve(entities?.map(u => lodash.omit(u, [ds.KEY])))
      })
    })
  }
  const add = async (id: string, details: Record<string, any>): Promise<any> => {
    const entry = await get(id)
    if (entry) {
      throw new Error('already exists')
    }
    const timestamp = Date.now()
    const key = ds.key([kind, id])
    const data = {
      creationTime: timestamp,
      timeUpdated: timestamp,
      id,
      ...details
    }
    return await new Promise((resolve, reject) => {
      ds.insert({ key, data }, err => { err ? reject(err) : resolve(data) })
    })
  }
  const batchAddEntities = async (entities: any[]): Promise<any> => {
    const [items] = await ds.get(entities.map(e => e.key))
    if (items && items.length > 0) {
      throw new Error('Entities already exist')
    }
    return await new Promise((resolve, reject) => {
      ds.insert(entities, err => { err ? reject(err) : resolve(entities) })
    })
  }
  const batchDelete = async (ids: string[]): Promise<any> => {
    const keys = ids.map(id => ds.key([kind, id]))
    return await new Promise((resolve, reject) => {
      ds.delete(keys, err => { err ? reject(err) : resolve(ids) })
    })
  }
  const batchGet = async (ids: string[]): Promise<any> => {
    if (!ids?.length) {
      return await Promise.resolve(null)
    }
    const keys = ids.map(id => ds.key([kind, id]))
    return await new Promise((resolve, reject) => {
      ds.get(keys, async (err, items) => {
        if (err) {
          reject(err); return
        }
        const filtered = items.map(u => lodash.omit(u, [ds.KEY]))
        resolve(filtered)
      })
    })
  }

  interface ListConfig {
    order?: Record<string, string>
    start: number
    limit: number
    filters: any[]
  }
  const list = async ({ order, start, limit, filters }: ListConfig): Promise<any> => {
    let query = ds.createQuery(kind)

    if (order?.property) {
      query = query.order(order.property, lodash.pick(order, ['descending']))
    }
    query = query.offset(start).limit(limit)

    if (filters) {
      filters.forEach(filter => {
        query = query.filter(filter.key, filter.operator || '=', filter.value)
      })
    }

    return await new Promise((resolve, reject) => {
      ds.runQuery(query, (err, response) => {
        // console.log(err, response);
        if (err) {
          reject(err); return
        }
        // const rr = response.map(r => Object.assign({}, r, {"_key": r[ds.KEY]}));
        const rr = response?.map(u => lodash.omit(u, [ds.KEY]))
        resolve(rr)
      })
    })
  }

  const update = async (id: string, details?: Record<string, any>, override?: boolean): Promise<any> => {
    const install = await get(id)
    if (!install) {
      return null
    }
    let newData = override ? details : mergeNonEmpty(install, details)
    newData = lodash.omit(newData, [ds.KEY])
    newData = lodash.assign({}, newData, { timeUpdated: Date.now() })
    const key = install[ds.KEY]
    return await new Promise((resolve, reject) => {
      ds.update({ key, data: newData }, err => { err ? reject(err) : resolve(newData) })
    })
  }
  const remove = async (id: string): Promise<any> => {
    const install = await get(id)
    if (!install) {
      return null
    }
    const key = install[ds.KEY]
    return await new Promise((resolve, reject) => {
      ds.delete(key, err => { err ? reject(err) : resolve(install) })
    })
  }

  const upsert = async (id: string, details: Record<string, any>): Promise<any> => {
    const install = await get(id)
    if (install) {
      return await update(id, details)
    } else {
      return await add(id, details)
    }
  }
  const key = (id: string): Key => {
    return ds.key([kind, id])
  }

  return {
    get,
    list,
    find,
    add,
    update,
    remove,
    upsert,
    batchGet,
    batchAddEntities,
    batchDelete,
    key

  }
}
