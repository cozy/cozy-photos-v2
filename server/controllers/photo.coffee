Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'

module.exports =
    fetch: (req, res, next, id) ->
        Photo.find id, (err, photo) =>
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Photo not found' if not photo

            req.photo = photo
            next()

    create: (req, res) ->
        photo = new Photo req.body
        raw = req.files['raw']
        thumb = req.files['thumb']
        Photo.create photo, (err, photo) ->
            return res.error 500, "Creation failed.", err if err

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
                return res.error 500, "Creation failed.", err if err

                res.send photo, 201

    raw: (req, res) ->
        res.setHeader 'Content-Type', 'image/jpg'
        res.setHeader 'Cache-Control', 'public, max-age=31557600'
        stream = req.photo.getFile 'raw', (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

    thumb: (req, res) ->
        res.set 'Content-Type', 'image/jpeg'
        res.setHeader 'Cache-Control', 'public, max-age=31557600'
        stream = req.photo.getFile 'thumb', (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

    update: (req, res) ->
        req.photo.updateAttributes req.body, (err) ->
            return res.error 500, "Update failed." if err

            res.send req.photo

    delete: (req, res) ->
        req.photo.destroy (err) ->
            return res.error 500, "Deletion failed." if err

            res.success "Deletion succeded."
