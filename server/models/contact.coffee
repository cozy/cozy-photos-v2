db = require '../db/cozy-adapter'

module.exports = Contact = db.define 'Contact',
    id : String
    fn : String
    datapoints : [Object]
    note : String
    _attachments : Object