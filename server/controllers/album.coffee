async = require 'async'
fs    = require 'fs'
archiver = require 'archiver'

Album = require '../models/album'
Photo = require '../models/photo'
CozyInstance = require '../models/cozy_instance'
sharing = require './sharing'
{slugify, noop} = require '../helpers/helpers'
downloader = require '../helpers/downloader'

try CozyAdapter = require 'americano-cozy/node_modules/jugglingdb-cozy-adapter'
catch e then CozyAdapter = require 'jugglingdb-cozy-adapter'

log = require('printit')
    date: false
    prefix: "album"

# Get all albums and their covers then put data into the index template.
# (For faster rendering).
module.exports.index = (req, res) ->
    async.parallel [
        (cb) -> Album.listWithThumbs cb
        (cb) -> CozyInstance.getLocale cb
    ], (err, results) ->
        [albums, locale] = results
        visible = []
        async.each albums, (album, callback) =>
            sharing.checkPermissions album, req, (err, isAllowed) =>
                visible.push album if isAllowed and not err
                callback null

        , (err) ->
            res.render 'index.jade', imports: """
                    window.locale = "#{locale}";
                    window.initalbums = #{JSON.stringify(visible)};
                """


# Retrieve given album data.
module.exports.fetch = (req, res, next, id) ->
    Album.find id, (err, album) ->
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'Album not found' if not album

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
module.exports.create = (req, res) ->
    album = new Album req.body
    Album.create album, (err, album) ->
        return res.error 500, "Creation failed.", err if err

        res.send album, 201


# Read given photo album if rights are not broken.
module.exports.read = (req, res) ->

    sharing.checkPermissions req.album, req, (err, isAllowed) ->
        if not isAllowed
            return res.error 401, "You are not allowed to view this album."

        else
            Photo.fromAlbum req.album, (err, photos) ->
                return res.error 500, 'An error occured', err if err

                # JugglingDb doesn't let you add attributes to the model
                out = req.album.toObject()
                out.photos = photos

                res.send out


# Generate a zip archive containing all photo attached to photo docs of give
# album.
module.exports.zip = (req, res, err) ->
    sharing.checkPermissions req.album, req, (err, isAllowed) ->
        if not isAllowed
            return res.error 401, "You are not allowed to view this album."

        else
            album = req.album
            archive = archiver 'zip'
            zipName = slugify req.album.title or 'Album'

            addToArchive = (photo, cb) ->
                # TODOS : Remove _attachment for photos
                if photo.binary?
                    path = "/data/#{photo.id}/binaries/raw"
                else if photo._attachments
                    path = "/data/#{photo.id}/attachments/raw"
                else
                    return cb()

                name = photo.title or "#{photo.id}.jpg"
                request = downloader.download path, (stream) ->
                    archive.append stream, name: name
                    cb()

            # Build zip from file list and pip the result in the response.
            makeZip = (zipName, photos) ->

                # Start the streaming.
                archive.pipe res

                # Arbort archiving process when the user aborts his request.
                res.on 'close', ->
                    archive.abort()

                # Set headers describing the final zip file.
                disposition = "attachment; filename=\"#{zipName}.zip\""
                res.setHeader 'Content-Disposition', disposition
                res.setHeader 'Content-Type', 'application/zip'

                async.eachSeries photos, addToArchive, (err) ->
                    if err then log.error "An error occured : #{err}"
                    else
                        archive.finalize (err, bytes) ->
                            if err then next err


            Photo.fromAlbum req.album, (err, photos) ->
                if err then res.error 500, 'An error occured', err
                else
                    makeZip zipName, photos


# Destroy album and all its photos.
module.exports.update = (req, res) ->
    req.album.updateAttributes req.body, (err) ->
        return res.error 500, "Update failed.", err if err

        res.send 200, req.album


# Destroy album and all its photos.
module.exports.delete = (req, res) ->
    req.album.destroy (err) ->
       return res.error 500, "Deletion failed.", err if err

       Photo.fromAlbum req.album, (err, photos) ->
           photo.destroy() for photo in photos

       res.success "Deletion succeded."
