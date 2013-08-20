db = require '../db/cozy-adapter'

module.exports = Photo = db.define 'Photo',
    id           : String
    title        : String
    description  : String
    orientation  : Number
    _attachments : Object
    albumid      : String
    date         : String

Photo.fromAlbum = (album, callback) ->
    params =
        startkey: [album.id]
        endkey: [album.id + "0"]
    Photo.request 'byalbum', params, callback

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
