Album = require '../models/album'
Photo = require '../models/photo'

module.exports =

    fetch: (req, res, next, id) ->
        console.log "album fetch"
        Album.find id, (err, album) ->
            if err
                next res.error 500, 'An error occured', err
            else if album == null
                next res.error 404, 'Album not found'
            else
                req.album = album
                next()

    list: (req, res) ->

        output = null
        albums = null
        photos = null

        albumPhotosOptions =
            reduce: true
            group: true

        reunion = ->
            if albums? and photos?
                for album in albums
                    for photo in photos
                        if photo.key is album._id
                            album.thumb = photo.value
                res.send albums

        Photo.rawRequest 'albumphotos', albumPhotosOptions, (err, result) ->
            photos = result
            reunion()

        Album.request 'all', (err, result) ->
            albums = result
            reunion()

    create: (req, res) ->
        album = new Album req.body
        Album.create album, (err, album) ->
            if not err then res.send album, 201
            else res.error 500, "Creation failed.", err

    read: (req, res) ->
        Photo.fromAlbum req.album, (err, photos) ->
            if err then res.error 500, 'An error occured', err
            else
                photos.forEach (photo) ->
                    photo.src = "photos/#{photo.id}.jpg"
                    photo.thumbsrc = "photos/thumbs/#{photo.id}.jpg"
                req.album.photos = photos
                res.send req.album

    photos: (req, res) ->
        Photo.fromAlbum req.album, (err, photos) ->
            if err then res.error 500, 'An error occured', err
            else
                photos.forEach (photo) ->
                    photo.src = "photos/#{photo.id}.jpg"
                    photo.thumbsrc = "photos/thumbs/#{photo.id}.jpg"
                res.send photos

    update: (req, res) ->
        req.album.updateAttributes req.body, (err) ->
            if err
                res.error 500, "Update failed.", err
            else
                res.send req.album

    delete: (req, res) ->
        req.album.destroy (err) ->
            if err
                res.error 500, "Deletion failed.", err
            else
                res.success "Deletion succeded."
