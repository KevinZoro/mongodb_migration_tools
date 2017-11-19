const mongoose = require('mongoose')
const Schema = mongoose.Schema
const targetConnection = global.targetConnection

const SystemUser = new Schema({
  name: String,
  email: String,
  disabled: Boolean,
  active: Boolean,
  avatar: String,
  remark: String,
  isSuperAdmin: Boolean,
  created: Date,
  password: String
}, {
  versionKey: false
})

module.exports = targetConnection.model('SystemUser', SystemUser, 'SystemUser')
