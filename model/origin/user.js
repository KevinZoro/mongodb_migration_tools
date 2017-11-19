const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const originConnection = global.originConnection

const user = new Schema({
  firstName: String,
  lastName: String,
  isDeleted: Boolean,
  created: Date,
  modified: Date,
  password: String,
  email: String,
  status: String,
  permissions: Schema.Types.Mixed,
  modifiedById: ObjectId
}, {
  versionKey: false
})

module.exports = originConnection.model('user', user, 'user')
