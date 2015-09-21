cozydb = require 'cozydb'

# Contacts are required to make sharing easier.
module.exports = class Contact extends cozydb.CozyModel
    id           : String
    fn           : String
    n            : String
    datapoints   : cozydb.NoSchema
    note         : String
    _attachments : cozydb.NoSchema
