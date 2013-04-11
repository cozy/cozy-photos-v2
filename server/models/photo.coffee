db = require '../db/cozy-adapter'

module.exports = Photo = db.define 'Photo',
    id           : String
    title        : String
    description  : String
    albumid      : String
    _attachments : Object

Photo.fromAlbum = (album, callback) ->
    Photo.request 'byalbum', key: album.id, callback

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