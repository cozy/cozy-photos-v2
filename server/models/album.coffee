americano = require 'americano-cozy'

module.exports = americano.getModel 'Album',
    id            : String
    title         : String
    description   : String
    date          : Date
    clearance     : String
    orientation   : Number
    coverPicture  : String

# clearance can be one of
# - public : in public list of album
# - hidden : accessible with proper URL
# - private : not visible from outside
