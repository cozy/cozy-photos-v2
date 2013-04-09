db = require '../db/cozy-adapter'

module.exports = db.define 'Album',
    title        : String
    description  : String
    thumb        : String
    photos       : [Object]
