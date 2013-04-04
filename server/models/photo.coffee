db = require '../db/cozy-adapter'

module.exports = Photo = db.define 'Photo',
    title        : String
    description  : String
    albumid      : String
    _attachments : Object

Photo.fromAlbum = (album, callback) ->
    keys =
        startKey:[album.id]
        endKey:[album.id]

    Photo.request 'byalbum', keys, callback