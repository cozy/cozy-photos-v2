Photo = require '../models/photo'
async = require 'async'

module.exports =

    fetch: (req, res, next, id) ->
        id = id.replace '.jpg', ''
        console.log id
        Photo.find id, (err, photo) =>
            if err
                res.error 500, 'An error occured', err
            else if photo == null
                res.error 404, 'Photo not found'
            else
                req.photo = photo
                next()

    create: (req, res) ->
        photo = new Photo req.body
        console.log req.files
        raw = req.files['raw']
        thumb = req.files['thumb']
        Photo.create photo, (err, photo) ->
            if err
                res.error 500, "Creation failed.", err
            else
                async.parallel [
                    (cb) -> photo.attachFile raw.path, {name: 'raw'}, cb
                    (cb) -> photo.attachFile thumb.path, {name: 'thumb'}, cb
                ], (err) ->
                    if err then res.error 500, "Creation failed.", err
                    else
                        photo.src = "photos/#{photo.id}.jpg"
                        photo.thumbsrc = "photos/thumbs/#{photo.id}.jpg"
                        res.send photo, 201

    raw: (req, res) ->
        res.contentType = "image/jpg"
        stream = req.photo.getFile 'raw', (err) ->
            res.error 500, "File fetching failed.", err if err

        stream.pipe res

    thumb: (req, res) ->
        res.contentType = "image/jpg"
        stream = req.photo.getFile 'thumb', (err) ->
            res.error 500, "File fetching failed.", err if err

        stream.pipe res

    update: (req, res) ->
        req.photo.updateAttributes req.body, (err) ->
            if err
                res.error 500, "Update failed."
            else
                res.send req.photo

    delete: (req, res) ->
        req.photo.destroy (err) ->
            if err
                res.error 500, "Deletion failed."
            else
                res.success "Deletion succeded."
