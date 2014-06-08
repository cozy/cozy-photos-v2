americano = require 'americano-cozy'

module.exports = americano.getModel 'Album',
    id            : String
    title         : String
    description   : String
    clearance     : String
    orientation   : Number

# clearance can be one of
# - public : in public list of album
# - hidden : accessible with proper URL
# - private : not visible from outside