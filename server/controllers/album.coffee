Album = require '../models/album'
Photo = require '../models/photo'

module.exports =

    fetch: (req, res, next, id) ->
        console.log 'in fetch : id='+id
        Album.find id, (err, album) ->
            if err
                next res.error 500, 'An error occured', err
            else if album == null
                next res.error 404, 'Album not found'
            else
                console.log album
                req.album = album
                next()

    list: (req, res) ->
        Album.request 'all', (err, albums) ->
            if not err then res.send albums
            else res.error 500, 'An error occured', err

    create: (req, res) ->
        album = new Album req.body
        Album.create album, (err, album) ->
            if not err then res.send album, 201
            else res.error 500, "Creation failed.", err

    read: (req, res) ->
        console.log req.album
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
                res.success "Update succeded."

    delete: (req, res) ->
        req.album.destroy (err) ->
            if err
                res.error 500, "Deletion failed.", err
            else
                res.success "Deletion succeded."
