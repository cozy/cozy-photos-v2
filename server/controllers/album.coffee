Album = require '../models/album'
Photo = require '../models/photo'
async = require 'async'
eyes = require 'eyes'

module.exports =

    fetch: (req, res, next, id) ->
        Album.find id, (err, album) ->
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Album not found' if not album

            req.album = album
            next()

    list: (req, res) ->

        async.parallel [
            (cb) -> Photo.albumsThumbs cb
            (cb) -> Album.request 'all', cb
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

        Photo.fromAlbum req.album, (err, photos) ->
            return res.error 500, 'An error occured', err if err

            # JugglingDb doesn't let you add attributes to the model
            out = req.album.toObject()
            out.photos = photos
            out.thumb = photos[0].id if photos.length

            res.send out

    update: (req, res) ->
        req.album.updateAttributes req.body, (err) ->
            return res.error 500, "Update failed.", err if err

            res.send req.album

    delete: (req, res) ->
        req.album.destroy (err) ->
            return res.error 500, "Deletion failed.", err if err

            res.success "Deletion succeded."
