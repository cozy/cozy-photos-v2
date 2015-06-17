cozydb  = require 'cozydb'
async   = require 'async'
fs      = require 'fs'
thumbHelpers = require '../helpers/thumb'

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
#Modif Rémi
    @patchGps: (callback) ->
        Photo.fromAlbum {folderId: "all" }, (err, photos) ->

            return callback err if err? # retour si erreur
            async.eachSeries photos, (photo, next) ->

                unless photo.gps?
                    gpsCoordinates = {}
                    photo.extractGpsFromBinary next
                else next()
            , callback

    extractGpsFromBinary: (callback) ->
        unless @binary.raw
             res = @getFile, (err) ->
             return callback err if err?

        else res = @getBinary 'raw', (err) ->
            return callback err if err?

        res.on 'ready', (stream) ->
            helper.readMetadata stream, (data) ->
                console.log data?.exif?.gps
                    # sauvegarde les données en bdd
                    # GPS = data.exif.gps if data?.exif?.gps? else {} # PROD
                    #@updateAttributes { gps: GPS }, (err) ->
                        #console.log 'impossible de mettre a jour les données'
                callback() # equivalent au next()



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
