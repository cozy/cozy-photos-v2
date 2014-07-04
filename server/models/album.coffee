americano = require 'americano-cozy'
CozyInstance = require './cozy_instance'

module.exports = Album = americano.getModel 'Album',
    id            : String
    title         : String
    description   : String
    date          : Date
    orientation   : Number
    coverPicture  : String
    clearance: (x) -> x

# clearance can be one of
# - public : in public list of album
# - hidden : accessible with proper URL
# - private : not visible from outside
Album.beforeSave = (next, data) ->
    data.title ?= ''
    data.title = data.title
                    .replace /<br>/g, ""
                    .replace /<div>/g, ""
                    .replace /<\/div>/g, ""
    next()

Album::getPublicURL = (callback) ->
    CozyInstance.getURL (err, domain) =>
        return callback err if err
        url = "#{domain}public/album/#{@id}"
        callback null, url
