const _ = require('lodash')

module.exports = class Migration {
  constructor (modelFrom, modelTo) {
    this.jobName = `sync data`
    this.modelFrom = require('../model/origin/' + modelFrom) // 原始collection
    this.modelTo = require('../model/target/' + modelTo) // 目标collection
    this.modelFromTable = modelFrom
    this.modelToTable = modelTo
    this.conditions = null // query的查询条件
    console.log(`create new Migration instance: ${modelTo}`.yellow)
  }

  // 默认不做任何操作，每个collection的对应关系不一样，需要在子类中重写此方法
  async format (obj) {
    return Promise.resolve(Object.assign(obj))
  }

  async count () {
    return this.modelFrom.count(this.conditions).exec()
  }

  async query (skip, limit) {
    return this.modelFrom.find(this.conditions, null, {skip: skip, limit: limit}).exec()
  }

  async syncMap (limit) {
    const totalStart = new Date().getTime()
    const _this = this
    const count = await _this.count()
    if (count === 0) {
      console.log(`${_this.modelFromTable} has no data`)
    }
    console.log(`${_this.jobName} from ${_this.modelFromTable} to ${_this.modelToTable}`.prompt)
    for (let i = 0; i < count; i += limit) {
      const start = new Date().getTime()
      const list = await _this.query(i, limit)
      console.log(`finish find skip ${i} costs ${(new Date().getTime() - start) / 1000}s`)
      try {
        const startWrite = new Date().getTime()
        await _this.writeToModelV2List(list)
        console.log(`finish write ${limit} costs ${(new Date().getTime() - startWrite) / 1000}s`)
      } catch (e) {
        if (e.code !== 11000) {
          console.error(e.message.error)
          return Promise.reject(e)
        }
      } finally {
        const finish = new Date().getTime()
        const cost = (finish - start) / 1000
        console.log(`process: ${((i + limit) > count) ? count : (i + limit)}/${count} costs ${cost} s`.info)
      }
    }
    const totalFinish = new Date().getTime()
    console.log(`${_this.jobName} from ${_this.modelFromTable} to ${_this.modelToTable} finished! Total Time:${(totalFinish - totalStart) / 1000} s`)
    return Promise.resolve()
  }

  async writeToModelV2List (list) {
    const _this = this
    try {
      let arr = []
      for (let i = 0; i < list.length; i++) {
        const obj = await _this.format(list[i])
        arr.push(obj)
      }

      // chunk list to several arrays with 1000 length
      const subList = _.chunk(arr, 1000)
      for (const subListItem of subList) {
        await _this.modelTo.insertMany(subListItem) // insertMany supports max length:1000
      }
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
