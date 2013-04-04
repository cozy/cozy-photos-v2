Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'

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
                    (cb) ->
                        data = name: 'raw', type: raw.type
                        photo.attachFile raw.path, data, ->
                            fs.unlink raw.path, cb
                    (cb) ->
                        data = name: 'thumb', type: thumb.type
                        photo.attachFile thumb.path, data, ->
                            fs.unlink thumb.path, cb
                ], (err) ->
                    if err then res.error 500, "Creation failed.", err
                    else
                        photo.src = "photos/#{photo.id}.jpg"
                        photo.thumbsrc = "photos/thumbs/#{photo.id}.jpg"
                        res.send photo, 201

    raw: (req, res) ->
        res.setHeader 'Content-Type', 'image/jpg'
        stream = req.photo.getFile 'raw', (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

    thumb: (req, res) ->
        res.set 'Content-Type', 'image/jpeg'
        stream = req.photo.getFile 'thumb', (err) ->
            if err then res.error 500, "File fetching failed.", err

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
