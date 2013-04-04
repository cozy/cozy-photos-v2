db = require '../db/cozy-adapter'

module.exports = Photo = db.define 'Photo',
    title        : String
    description  : String
    albumid      : String
    _attachments : Object

Photo.fromAlbum = (album, callback) ->
    params =
        key: album.id

    console.log "params=", params

    Photo.request 'byalbum', params, callback