americano = require 'americano-cozy'

module.exports = Photo = americano.getModel 'Photo',
    id           : String
    title        : String
    description  : String
    orientation  : Number
    binary       : (x) -> x
    _attachments : Object
    albumid      : String
    date         : String

# Get all photo linked to given album
Photo.fromAlbum = (album, callback) ->
    if album.folderid is "all"
        Photo.request 'all', {}, callback
    else
        params =
            startkey: [album.id]
            endkey: [album.id + "0"]
        Photo.request 'byalbum', params, callback

# Get all thumbnails of a given photo album.
Photo.albumsThumbs = (callback) ->
    params =
        reduce: true
        group: true

    Photo.rawRequest 'albumphotos', params, (err, results) ->
        return callback(err) if err

        out = {}
        for result in results
            out[result.key] = result.value

        callback null, out
