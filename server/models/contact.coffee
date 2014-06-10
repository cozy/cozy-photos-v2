americano = require 'americano-cozy'

# Contacts are required to make sharing easier.
module.exports = americano.getModel 'Contact',
    id : String
    fn : String
    datapoints : [Object]
    note : String
    _attachments : Object
