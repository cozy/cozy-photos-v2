async = require 'async'
fs    = require 'fs'
archiver = require 'archiver'

Album = require '../models/album'
Photo = require '../models/photo'
sharing = require './sharing'
cozydb = require 'cozydb'
{slugify, noop} = require '../helpers/helpers'
downloader = require '../helpers/downloader'
{NotFound, NotAllowed} = require '../helpers/errors'

log = require('printit')
    date: false
    prefix: "album"

# Get all albums and their covers then put data into the index template.
# (For faster rendering).
module.exports.index = (req, res, next) ->
    async.parallel [
        (cb) -> Album.listWithThumbs cb
        (cb) -> cozydb.api.getCozyLocale cb
    ], (err, results) ->
        return next err if err

        [albums, locale] = results
        visible = []
        async.each albums, (album, callback) =>
            sharing.checkPermissions album, req, (err, isAllowed) =>
                visible.push album if isAllowed and not err
                callback null

        , (err) ->
            res.render 'index', imports: """
                    window.locale = "#{locale}";
                    window.initalbums = #{JSON.stringify(visible)};
                """


# Retrieve given album data.
module.exports.fetch = (req, res, next, id) ->
    Album.find id, (err, album) ->
        if err
            next err
        else if not album
            next NotFound "Album #{id}"
        else
            req.album = album
            next()


# Get all albums and their cover.
module.exports.list = (req, res, next) ->

    Album.listWithThumbs (err, albums) ->
        return next err if err

        visible = []
        async.each albums, (album, callback) =>
            sharing.checkPermissions album, req, (err, isAllowed) =>
                visible.push album if isAllowed and not err
                callback null

        , (err) ->
            return next err if err
            res.send visible

# Create new photo album.
module.exports.create = (req, res, next) ->
    album = new Album req.body
    Album.create album, (err, album) ->
        return next err if err

        res.status(201).send album


# Read given photo album if rights are not broken.
module.exports.read = (req, res, next) ->

    sharing.checkPermissions req.album, req, (err, isAllowed) ->
        if not isAllowed
            next NotAllowed()

        else
            Photo.fromAlbum req.album, (err, photos) ->
                return next err if err

                # JugglingDb doesn't let you add attributes to the model
                out = req.album.toObject()
                out.photos = photos

                res.send out


# Generate a zip archive containing all photo attached to photo docs of give
# album.
module.exports.zip = (req, res, next) ->
    sharing.checkPermissions req.album, req, (err, isAllowed) ->
        if not isAllowed
            next NotAllowed()

        else
            album = req.album
            archive = archiver 'zip'
            zipName = slugify req.album.title or 'Album'

            addToArchive = (photo, cb) ->

                # Photo uploaded from the app.
                if photo?.binary.raw?
                    type = 'raw'

                # Photo imported from Files.
                else if photo?.binary.file?
                    type = 'file'
                else
                    # There is nothing to download for this photo.
                    return cb()

                # Get a stream  of the binary.
                laterStream = photo.getBinary type, (err) ->
                    if err?
                        log.error "An error occured while adding a photo to
                                   archive. Photo: #{photo.id}."
                        log.raw err
                        cb()

                # Append the stream photo to the archive.
                laterStream.on 'ready', (stream) ->
                    # Get the file's name in the archive.
                    name = photo.title or "#{photo.id}.jpg"
                    archive.append stream, {name}
                    cb()

            # Build zip from file list and pip the result in the response.
            makeZip = (zipName, photos) ->

                # Start the streaming.
                archive.pipe res

                # Abort archiving process when the user aborts his request.
                res.on 'close', ->
                    archive.abort()

                # Set headers describing the final zip file.
                disposition = "attachment; filename=\"#{zipName}.zip\""
                res.setHeader 'Content-Disposition', disposition
                res.setHeader 'Content-Type', 'application/zip'

                # Append all photos to the archive.
                async.eachSeries photos, addToArchive, (err) ->
                    if err
                        log.error "An error occured: #{err}"
                    else
                        # Make the archive as ready.
                        archive.finalize()


            Photo.fromAlbum req.album, (err, photos) ->
                if err then next err
                else
                    makeZip zipName, photos


module.exports.update = (req, res, next) ->
    req.album.updateAttributes req.body, (err) ->
        return next err if err
        res.send req.album


# Destroy album and all its photos.
module.exports.delete = (req, res, next) ->
    req.album.destroy (err) ->
       return next err if err

       Photo.fromAlbum req.album, (err, photos) ->
           photo.destroy() for photo in photos

       res.send success: "Deletion succeded."
