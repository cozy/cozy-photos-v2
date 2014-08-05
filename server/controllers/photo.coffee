Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
qs = require 'qs'
im = require 'imagemagick'
multiparty = require 'multiparty'
sharing = require './sharing'

app = null
module.exports.setApp = (ref) -> app = ref

# Get given photo, returns 404 if photo is not found.
module.exports.fetch = (req, res, next, id) ->
    id = id.substring 0, id.length - 4 if id.indexOf('.jpg') > 0
    Photo.find id, (err, photo) =>
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'Photo not found' if not photo

        req.photo = photo
        next()

# Create a photo and save file, thumb and scree image as attachments of the
# photo document.
module.exports.create = (req, res, next) =>
    cid = null
    lastPercent = 0
    files = {}

    # Parse given form to extract image blobs.
    form = new multiparty.Form
        uploadDir: __dirname + '../../uploads'
        defer: true # don't wait for full form. Needed for progress events
        keepExtensions: true
        maxFieldsSize: 10 * 1024 * 1024
    form.parse req

    # Get fields from form.
    form.on 'field', (name, value) ->
        req.body[name] = value
        cid = value if name is 'cid'

    # Get files from form.
    form.on 'file', (name, val) ->
        val.name = val.originalFilename
        val.type = val.headers['content-type'] or null
        files[name] = val

    # Get progress to display it to the user. Data are sent via websocket.
    form.on 'progress', (bytesReceived, bytesExpected) ->
        return unless cid?
        percent = bytesReceived/bytesExpected
        return unless percent - lastPercent > 0.05

        lastPercent = percent
        app.io.sockets.emit 'uploadprogress', cid: cid, p: percent

    form.on 'error', (err) ->
        next err

    # When form is fully parsed, data are saved into CouchDB.
    form.on 'close', ->
        req.files = qs.parse files
        raw = req.files['raw']
        im.readMetadata raw.path, (err, metadata) ->
            if err?
                console.log "[Create photo - Exif metadata extraction]"
                console.log "Are you sure imagemagick is installed ?"
                next err
            else
                # Add date and orientation from EXIF data.
                if metadata?.exif?.orientation?
                    req.body.orientation = metadata.exif.orientation
                else
                    req.body.orientation = 1
                if metadata?.exif?.dateTime?
                    req.body.date = metadata.exif.dateTime
            photo = new Photo req.body

            Photo.create photo, (err, photo) ->
                return next err if err

                async.series [
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
                                console.log 'Could not delete %s', file.path

                    if err
                        return next err
                    else
                        res.send photo, 201


doPipe = (req, which, download, res) ->

    sharing.checkPermissionsPhoto req.photo, req, (err, isAllowed) ->

        if err or not isAllowed
            return res.error 401, "Not allowed", err

        if download
            disposition = 'attachment; filename=' + req.photo.title
            res.setHeader 'Content-disposition', disposition

        request = req.photo.getFile which, (err) ->
            if err and not res.statusCode
                res.error 500, "File fetching failed.", err

        # This is a temporary hack to allow caching
        # ideally, we would do as follow :
        # request.headers['If-None-Match'] = req.headers['if-none-match']
        # but couchdb goes 500 (COUCHDB-1697 ?)
        request.pipefilter = (couchres, myres) ->
            if couchres.headers.etag is req.headers['if-none-match']
                myres.send 304

        request.pipe res


# Get mid-size version of the picture.
module.exports.screen = (req, res) ->
    which = if req.photo._attachments.screen then 'screen' else 'raw'
    doPipe req, which, false, res

# Get a small size of the picture.
module.exports.thumb = (req, res) ->
    doPipe req, 'thumb', false, res

# Get raw version f the picture (file orginally sent).
module.exports.raw = (req, res) ->
    doPipe req, 'raw', true, res

module.exports.update = (req, res) ->
    req.photo.updateAttributes req.body, (err) ->
        return res.error 500, "Update failed." if err
        res.send req.photo

module.exports.delete = (req, res) ->
    req.photo.destroy (err) ->
        return res.error 500, "Deletion failed." if err
        res.success "Deletion succeded."


# Thumbs can change a lot depending on UI. If a change occurs, previously built
# thumbnails doesn't fit anymore with the new style. So this route allows to
# update the thumbnail for a given picture.
module.exports.updateThumb = (req, res, next) ->
    files = {}
    form = new multiparty.Form
        uploadDir: __dirname + '../../uploads'
        defer: true # don't wait for full form. Needed for progress events
        keepExtensions: true
        maxFieldsSize: 10 * 1024 * 1024

    form.parse req

    # Get file from form.
    form.on 'file', (name, val) ->
        val.name = val.originalFilename
        val.type = val.headers['content-type'] or null
        files[name] = val

    form.on 'error', (err) ->
        next err

    # When form is fully parsed, save the sent thumbnailS as attachment.
    form.on 'close', ->
        req.files = qs.parse files
        thumb = req.files['thumb']
        data = name: 'thumb', type: thumb.type

        req.photo.attachFile thumb.path, data, (err) ->
            return next err if err

            fs.unlink thumb.path, (err) ->
                return next err if err
                res.send success: true
