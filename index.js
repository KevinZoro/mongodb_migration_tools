const DB = require('./db')
const config = require('config')
const colors = require('colors')

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
})

const SPLIT_LIMIT = config.get('SPLIT_LIMIT')

try {
  (async () => {
    const originDB = new DB(config.get('db')['mongo']['originLink'])
    const targetDB = new DB(config.get('db')['mongo']['targetLink'])

    global.originConnection = await originDB.createConnection()
    global.targetConnection = await targetDB.createConnection()

    const Migration = require('./lib/migration')
    const Tasks = require('./tasks')

    const modelMap = {
      SystemUser: ['user', 'SystemUser']
    }

    const justCopyMap = {
      // 这里写些只用复制不用改key的collection
    }

    for (let key in modelMap) {
      const originCollection = modelMap[key][0]
      const targetCollection = modelMap[key][1]
      const task = new Tasks[key](originCollection, targetCollection)
      await task.syncMap(SPLIT_LIMIT)
    }

    for (let key in justCopyMap) {
      const originCollection = modelMap[key][0]
      const targetCollection = modelMap[key][1]
      const task = new Migration(originCollection, targetCollection)
      await task.syncMap(SPLIT_LIMIT)
    }
  })()
} catch (err) {
  console.error(err.message)
}
