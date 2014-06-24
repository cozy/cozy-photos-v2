Album = require '../models/album'
Photo = require '../models/photo'
CozyInstance = require '../models/cozy_instance'
async = require 'async'
fs    = require 'fs'
zipstream = require 'zip-stream'
{slugify, noop} = require '../helpers/helpers'

try CozyAdapter = require 'americano-cozy/node_modules/jugglingdb-cozy-adapter'
catch e then CozyAdapter = require 'jugglingdb-cozy-adapter'

log = require('printit')
    date: false
    prefix: "album"


# Get all albums and their covers then put data into the index template.
# (For faster rendering).
module.exports.index = (req, res) ->
    out = []
    initAlbums = (albums, callback) =>
        if albums.length > 0
            albumModel = albums.pop()
            album = albumModel.toObject()
            Photo.fromAlbum album, (err, photos) =>
                if photos.length > 0
                    album.coverPicture ?= photos[0].id
                    album.orientation = photos[0].orientation

                out.push album
                initAlbums albums, callback
        else
            callback()

    request = if req.public then 'byTitlePublic' else 'byTitle'

    async.parallel [
        (cb) -> Album.request request, cb
        (cb) -> CozyInstance.getLocale cb
    ], (err, results) ->

        [albums, locale] = results
        initAlbums albums, () =>
            imports = """
                    window.locale = "#{locale}";
                    window.initalbums = #{JSON.stringify(out.reverse())};
                """
            res.render 'index.jade', imports: imports


# Retrieve given album data.
module.exports.fetch = (req, res, next, id) ->
    Album.find id, (err, album) ->
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'Album not found' if not album

        req.album = album
        next()


# Get all albums and their cover.
module.exports.list = (req, res) ->

    request = if req.public then 'byTitlePublic' else 'byTitle'

    async.parallel [
        (cb) -> Photo.albumsThumbs cb
        (cb) -> Album.request request, cb
    ], (err, results) ->
        [photos, albums] = results
        out = []
        for albumModel in albums
            album = albumModel.toObject()
            album.coverPicture ?= photos[album.id]
            out.push album

        res.send out


# Create new photo album.
module.exports.create = (req, res) ->
    album = new Album req.body
    Album.create album, (err, album) ->
        return res.error 500, "Creation failed.", err if err

        res.send album, 201


# Send sharing email to given contact.
module.exports.sendMail = (req, res) ->
    data =
        to: req.body.mails
        subject: "I share an album with you"
        content: "You can access to my album via this link: #{req.body.url}"
    CozyAdapter.sendMailFromUser data, (err) ->
        return res.error 500, "Server couldn't send mail.", err if err
        res.send 200


# Read given photo album if rights are not broken.
module.exports.read = (req, res) ->

    if req.album.clearance is 'private' and req.public
        return res.error 401, "You are not allowed to view this album."

    Photo.fromAlbum req.album, (err, photos) ->
        return res.error 500, 'An error occured', err if err

        # JugglingDb doesn't let you add attributes to the model
        out = req.album.toObject()
        out.photos = photos
        out.thumb = photos[0].id if photos.length

        res.send out


# Generate a zip archive containing all photo attached to photo docs of give
# album.
module.exports.zip = (req, res, err) ->
    Photo.fromAlbum req.album, (err, photos) ->
        return res.error 500, 'An error occured', err if err
        return res.error 401, 'The album is empty' unless photos.length

        zip = new zipstream()

        log.debug "zip started"
        addToZip = (photo, cb) ->
            stream = photo.getFile 'raw', noop
            extension = photo.title.substr photo.title.lastIndexOf '.'
            photoname = photo.title.substr 0, photo.title.lastIndexOf '.'
            photoname = slugify(photoname) + extension
            log.debug "zip #{photoname}"
            zip.entry stream, name: photoname, cb

        async.eachSeries photos, addToZip, (err) ->
            next err if err
            log.debug 'zip finished'
            zip.finalize()

        zipname = slugify req.album.title
        disposition = "attachment; filename=\"#{zipname}.zip\""
        res.setHeader 'Content-Disposition', disposition
        res.setHeader 'Content-Type', 'application/zip'
        zip.pipe res


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
