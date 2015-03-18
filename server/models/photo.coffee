cozydb = require 'cozydb'
async = require 'async'
cozydb = require 'cozydb'

module.exports = class Photo extends cozydb.CozyModel
    @schema:
        id           : String
        title        : String
        description  : String
        orientation  : Number
        binary       : cozydb.NoSchema
        _attachments : Object
        albumid      : String
        date         : String


    # Get all photo linked to given album
    @fromAlbum: (album, callback) ->
        if album.folderid is "all"
            Photo.request 'all', {}, callback
        else
            params =
                startkey: [album.id]
                endkey: [album.id + "0"]
            Photo.request 'byalbum', params, callback

    # Get all thumbnails of a given photo album.
    @albumsThumbs: (callback) ->
        params =
            reduce: true
            group: true

        Photo.rawRequest 'albumphotos', params, (err, results) ->
            return callback(err) if err

            out = {}
            for result in results
                out[result.key] = result.value

            callback null, out

    destroyWithBinary: (callback) ->
        if @binary? and typeof(@binary) is 'object'
            binaries = Object.keys @binary
            async.eachSeries binaries, (bin, cb) =>
                @removeBinary bin, (err) =>
                    if err
                        console.log """
                            Cannot destroy binary linked to photo #{@id}"""
                    cb()
            , (err) =>
                @destroy callback
        else
            @destroy callback
