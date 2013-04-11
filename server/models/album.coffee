db = require '../db/cozy-adapter'

module.exports = db.define 'Album',
    id           : String
    title        : String
    description  : String
