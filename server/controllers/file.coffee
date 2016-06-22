File = require '../models/file'
Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
thumbHelpers = require '../helpers/thumb'
log = require('printit')
    date: true
    prefix: "file"

onThumbCreation = require('../helpers/initializer').onThumbCreation
fileByPage = 5 * 12

# Get given file, returns 404 if photo is not found.
module.exports.fetch = (req, res, next, id) ->
    id = id.substring 0, id.length - 4 if id.indexOf('.jpg') > 0
    File.find id, (err, file) ->
        if err
            next err
        else if not file
            err = new Error "File #{id} not found"
            err.status = 404
            next err
        else
            req.file = file
            next()

# Return a list of file for a given month
module.exports.list = (req, res, next) ->

    if req.params.page?
        skip = parseInt(req.params.page) * fileByPage
    else
        skip = 0

    dates = {}
    # We retrieve photos correspond to a modal page
    # Retrieve one more photo to know if it exists photos after this page
    # Skip is used to have the well photos (for page req.params.page)
    # Descending is true to have photos sorted by date (more recent in first)
    options =
        limit: fileByPage + 1
        skip: skip
        descending: true
    File.imageByDate options, (err, photos) ->
        return next err if err

        # Check if it exists a page after
        if photos.length is fileByPage + 1
            hasNext = true
        else
            hasNext = false

        photos.splice fileByPage, 1
        for photo in photos
            # Sort photos by month
            date = new Date(photo.lastModification)
            mounth = date.getMonth() + 1
            mounth = if mounth > 9 then "#{mounth}" else "0#{mounth}"
            date = "#{date.getFullYear()}-#{mounth}"
            if dates[date]?
                dates[date].push photo
            else
                dates[date] = [photo]

        res.send {files: dates, hasNext: hasNext}


# Return thumb for given file.
module.exports.thumb = (req, res, next) ->
    if res.connection and not res.connection.destroyed
        which = if req.file.binary.thumb then 'thumb' else 'file'
        stream = req.file.getBinary which, (err) ->
            return next err if err
        stream.pipe res
        res.on 'close', -> stream.abort()



download = (res, file, rawFile, callback) ->
    if res.connection and not res.connection.destroyed
        fs.openSync rawFile, 'w'
        stream = file.getBinary 'file', callback
        stream.pipe fs.createWriteStream rawFile
        res.on 'close', -> stream.abort()

module.exports.createPhoto = (req, res, next) ->
    file = req.file

    return next new Error('no binary') unless file.binary?

    # Create photo document
    photo =
        date         : file.lastModification
        title        : ""
        description  : ""
        orientation  : 1
        albumid      : "#{req.body.albumid}"
        binary       : file.binary

    Photo.create photo, (err, photo) ->
        if err?
            log.error "Error creating photo from file #{file.id}"
            log.raw err
            return next err

        if photo.binary?.thumb? and photo.binary.screen?
            res.status(201).send photo
        else
            # Add content thumb or screen if necessary
            rawFile = "/tmp/#{photo.id}"
            download res, file, rawFile, (err) ->
                if err?
                    log.error "Error downloading photo from file #{file.id}"
                    log.raw err
                    fs.unlink rawfile ->
                        return next err
                else
                    if not photo.binary.thumb?
                        thumbHelpers.resize rawFile, photo, 'thumb', (err) ->
                            if err?
                                log.error "Error resizing thumb #{photo.id}"
                                log.raw err
                                fs.unlink rawfile ->
                                    return next err
                            else
                                thumbHelpers.resize rawFile, photo, 'screen', (err) ->
                                    if err?
                                        log.error "Error resizing screen #{photo.id}"
                                        log.raw err
                                    fs.unlink rawFile, ->
                                        res.status(201).send photo
                    else if not photo.binary.screen?
                        thumbHelpers.resize rawFile, photo, 'screen', (err) ->
                            if err?
                                log.error "Error resizing screen #{photo.id}"
                                log.raw err
                            fs.unlink rawFile, ->
                                res.status(201).send photo
