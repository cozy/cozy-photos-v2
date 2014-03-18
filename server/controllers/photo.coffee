Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
qs = require 'qs'
im = require 'imagemagick'

app = null
module.exports.setApp = (ref) -> app = ref

module.exports.fetch = (req, res, next, id) ->
        Photo.find id, (err, photo) =>
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Photo not found' if not photo

            req.photo = photo
            next()

module.exports.create = (req, res) =>
        cid = null
        lastPercent = 0
        files = {}

        req.form.on 'field', (name, value) ->
            cid = value if name is 'cid'

        req.form.on 'file', (name, val) ->
            val.name = val.originalFilename
            val.type = val.headers['content-type'] or null
            files[name] = val

        req.form.on 'progress', (bytesReceived, bytesExpected) ->
            return unless cid?
            percent = bytesReceived/bytesExpected
            return unless percent - lastPercent > 0.05

            lastPercent = percent
            app.io.sockets.emit 'uploadprogress', cid: cid, p: percent

        req.form.on 'close', =>
            req.files = qs.parse files
            raw = req.files['raw']
            im.readMetadata raw.path, (err, metadata) ->
                if err?
                    console.log "[Create photo - Exif metadata extraction]"
                    console.log err
                    console.log "Are you sure imagemagick is installed ?"
                else
                    if metadata?.exif?.orientation?
                        req.body.orientation = metadata.exif.orientation
                    else
                        req.body.orientation = 1
                    if metadata?.exif?.dateTime?
                        req.body.date = metadata.exif.dateTime
                photo = new Photo req.body
                Photo.create photo, (err, photo) ->
                    return res.error 500, "Creation failed.", err if err

                    async.parallel [
                        (cb) ->
                            raw = req.files['raw']
                            data = name: 'raw', type: raw.type
                            photo.attachFile raw.path, data, cb
                        (cb) ->
                            screen = req.files['screen']
                            data = name: 'screen', type: screen.type
                            photo.attachFile screen.path, data, cb
                        (cb) ->
                            thumb = req.files['thumb']
                            data = name: 'thumb', type: thumb.type
                            photo.attachFile thumb.path, data, cb
                    ], (err) ->
                        for name, file of req.files
                            fs.unlink file.path, (err) ->
                                if err
                                    console.log 'Could not delete', file.path

                        if err
                            return res.error 500, "Creation failed.", err
                        else
                            res.send photo, 201

module.exports.screen = (req, res) ->
        res.setHeader 'Content-Type', 'image/jpg'
        res.setHeader 'Cache-Control', 'public, max-age=31557600'
        res.setHeader 'Content-disposition', 'attachment; filename=' + req.photo.title
        which = if req.photo._attachments.screen then 'screen' else 'raw'
        stream = req.photo.getFile which, (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

module.exports.thumb = (req, res) ->
        res.set 'Content-Type', 'image/jpeg'
        res.setHeader 'Cache-Control', 'public, max-age=31557600'
        stream = req.photo.getFile 'thumb', (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

module.exports.raw = (req, res) ->
        res.set 'Content-Type', 'image/jpeg'
        res.setHeader 'Cache-Control', 'public, max-age=31557600'
        res.setHeader 'Content-disposition', 'attachment; filename=' + req.photo.title
        stream = req.photo.getFile 'raw', (err) ->
            if err then res.error 500, "File fetching failed.", err

        stream.pipe res

module.exports.update = (req, res) ->
        req.photo.updateAttributes req.body, (err) ->
            return res.error 500, "Update failed." if err

            res.send req.photo

module.exports.delete = (req, res) ->
        req.photo.destroy (err) ->
            return res.error 500, "Deletion failed." if err

            res.success "Deletion succeded."
