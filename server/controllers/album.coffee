Album = require '../models/album'
Photo = require '../models/photo'
async = require 'async'
zipstream = require 'zipstream'
fs = require 'fs'
{slugify, noop} = require '../helpers/helpers'

module.exports = (app) ->

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
                for photo in photos
                    photo.destroy()

            res.success "Deletion succeded."
