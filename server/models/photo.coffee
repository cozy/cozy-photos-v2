cozydb  = require 'cozydb'
async   = require 'async'
fs      = require 'fs'
Helpers = require '../helpers/thumb'
log     = require('printit')
    date: true
    prefix: "model:photo"

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
        gps          : Object


    # Get all photo linked to given album
    @fromAlbum: (album, callback) ->
        if album.folderid is "all"
            Photo.request 'all', {}, callback
        else
            params =
                startkey: [album.id]
                endkey: [album.id + "0"]
            Photo.request 'byalbum', params, callback

    # Patch every photo to add GPS data
    @patchGps: (callback) ->
        Photo.fromAlbum {folderId: "all" }, (err, photos) ->

            return callback err if err? # error on request fail
            async.eachSeries photos, (photo, next) ->

                # Don't try to extract data if we already got them
                if photo.binary? && !(photo.gps? && photo.date?)
                    photo.extractGpsFromBinary next
                else setImmediate next
            , callback

    extractGpsFromBinary: (callback) ->
        kind = if @binary.raw then 'raw' else 'file'
        res  = @getBinary kind, (err) ->
            log.error err if err?

        res.on 'ready', (stream) =>
            Helpers.readMetadata stream, (err, data) =>
                if err?
                    log.error "Error reading metadata of #{@id} / #{@title}"
                    log.error err
                    callback()
                else
                    @updateAttributes { gps: data.exif.gps, date: data.exif.date }, (err) ->
                        log.error err if err?
                        callback() # ~ next()



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
                        log.error """
                            Cannot destroy binary linked to photo #{@id}"""
                    cb()
            , (err) =>
                @destroy callback
        else
            @destroy callback
