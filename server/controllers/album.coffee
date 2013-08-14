Album = require '../models/album'
Photo = require '../models/photo'
CozyAdapter = require 'jugglingdb-cozy-adapter'
i18n  = require 'cozy-i18n-helper'
async = require 'async'
fs    = require 'fs'
zipstream = require 'zipstream'
{slugify, noop} = require '../helpers/helpers'

module.exports = (app) ->

    index: (req, res) ->

        out = []
        initAlbums = (albums, callback) =>
            if albums.length > 0
                albumModel = albums.pop()
                album = albumModel.toObject()
                Photo.fromAlbum album, (err, photos) =>
                    if photos.length > 0
                        album.thumb = photos[0].id
                        album.orientation = photos[0].orientation
                    out.push album
                    initAlbums albums, callback
            else
                callback()

        request = if req.public then 'public' else 'all'

        async.parallel [
            (cb) -> Album.request request, cb
            (cb) -> i18n.getLocale null, cb
        ], (err, results) ->

            [albums, locale] = results
            initAlbums albums, () =>
                imports = """
                        window.locale = "#{locale}";
                        window.initalbums = #{JSON.stringify(out)};
                    """
                res.render 'index.jade', imports: imports


    fetch: (req, res, next, id) ->
        Album.find id, (err, album) ->
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Album not found' if not album

            req.album = album
            next()

    list: (req, res) ->

        request = if req.public then 'public' else 'all'

        async.parallel [
            (cb) -> Photo.albumsThumbs cb
            (cb) -> Album.request request, cb
        ], (err, results) ->
            [photos, albums] = results
            out = []
            for albumModel in albums
                album = albumModel.toObject()
                album.thumb = photos[album.id]
                out.push album

            res.send out

    create: (req, res) ->
        album = new Album req.body
        Album.create album, (err, album) ->
            return res.error 500, "Creation failed.", err if err

            res.send album, 201

    sendMail: (req, res) ->
        data =
            to: req.body.mails
            subject: "I share an album with you"
            content: "You can access to my album via this link: #{req.body.url}"
        CozyAdapter.sendMailFromUser data, (err) ->
            return res.error 500, "Server couldn't send mail.", err if err
            res.send 200

    read: (req, res) ->

        if req.album.clearance is 'private' and req.public
            return res.error 401, "You are not allowed to view this album."

        Photo.fromAlbum req.album, (err, photos) ->
            return res.error 500, 'An error occured', err if err

            # JugglingDb doesn't let you add attributes to the model
            out = req.album.toObject()
            out.photos = photos
            out.thumb = photos[0].id if photos.length

            res.send out

    zip: (req, res) ->
        Photo.fromAlbum req.album, (err, photos) ->
            return res.error 500, 'An error occured', err if err
            return res.error 401, 'The album is empty' unless photos.length

            zip = zipstream.createZip level: 1

            addToZip = (photo, cb) ->
                stream = photo.getFile 'raw', noop
                extension = photo.title.substr photo.title.lastIndexOf '.'
                photoname = photo.title.substr 0, photo.title.lastIndexOf '.'
                photoname = slugify(photoname) + extension
                zip.addFile stream, name: photoname, cb

            async.eachSeries photos, addToZip, (err) ->
                zip.finalize noop

            zipname = slugify(req.album.title)
            disposition = "attachment; filename=\"#{zipname}.zip\""
            res.setHeader 'Content-Disposition', disposition
            res.setHeader 'Content-Type', 'application/zip'
            zip.pipe res



    update: (req, res) ->
        req.album.updateAttributes req.body, (err) ->
            return res.error 500, "Update failed.", err if err

            res.send req.album

    delete: (req, res) ->
        req.album.destroy (err) ->
            return res.error 500, "Deletion failed.", err if err

            Photo.fromAlbum req.album, (err, photos) ->
                photo.destroy() for photo in photos

            res.success "Deletion succeded."
