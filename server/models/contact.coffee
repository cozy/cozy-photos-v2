americano = require 'americano-cozy'

module.exports = americano.getModel 'Contact',
    id : String
    fn : String
    datapoints : [Object]
    note : String
    _attachments : Object