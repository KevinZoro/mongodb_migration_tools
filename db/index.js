const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
class DB {
  constructor (linkUrl) {
    this.linkUrl = linkUrl
  }

  //创建连接池
  async createConnection () {
    const db = await mongoose.createConnection(this.linkUrl, { useMongoClient: true }).then((db) => {
      console.log(`connecting ${this.linkUrl}`.debug)
      return Promise.resolve(db)
    })
    return db
  }
}

module.exports = DB
