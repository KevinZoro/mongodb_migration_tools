const Migration = require('../lib/migration')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class SystemUser extends Migration {
  async format (obj) {
    return Promise.resolve({
      _id: ObjectId(obj._id),
      name: obj.name,
      email: obj.email,
      password: obj.password,
      disabled: false,
      active: obj.status === 'active',
      avatar: '',
      remark: '',
      isSuperAdmin: obj.permissions === 'superadmin',
      created: obj.created
    })
  }
}
