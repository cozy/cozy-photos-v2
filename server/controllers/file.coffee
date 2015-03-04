File = require '../models/file'
Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
thumbHelpers = require '../helpers/thumb'

onThumbCreation = require('../../init').onThumbCreation
fileByPage = 5 * 12

# Get given file, returns 404 if photo is not found.
module.exports.fetch = (req, res, next, id) ->
    id = id.substring 0, id.length - 4 if id.indexOf('.jpg') > 0
    File.find id, (err, file) =>
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'File not found' if not file

        req.file = file
        next()

# Return a list of file for a given month
module.exports.list = (req, res, next) ->

    if req.params.page?
        skip = parseInt(req.params.page) * fileByPage
    else
        skip = 0

    dates = {}
    options =
        limit: fileByPage + 1
        skip: skip
        descending: true
    File.imageByDate options, (err, photos) =>
        if err
            return res.error 500, 'An error occured', err
        else

            if photos.length is fileByPage + 1
                hasNext = true
            else
                hasNext = false

            photos.splice fileByPage, 1
            for photo in photos
                date = new Date(photo.lastModification)
                mounth = date.getMonth() + 1
                mounth = if mounth > 9 then "#{mounth}" else "0#{mounth}"
                date = "#{date.getFullYear()}-#{mounth}"
                if dates[date]?
                    dates[date].push photo
                else
                    dates[date] = [photo]

            res.send {files: dates, hasNext: hasNext}, 200


# Return thumb for given file.
module.exports.thumb = (req, res, next) ->
    which = if req.file.binary.thumb then 'thumb' else 'file'
    stream = req.file.getBinary which, (err) ->
        return next err if err
    stream.pipe res


module.exports.createPhoto = (req, res, next) ->
    file = req.file

    return next new Error('no binary') unless file.binary?

    photo =
        date         : file.lastModification
        title        : ""
        description  : ""
        orientation  : 1
        albumid      : "#{req.body.albumid}"
        binary       : file.binary

    Photo.create photo, (err, photo) ->
        return next err if err

        if photo.binary?.thumb? and photo.binary.screen?
            res.send 201, photo
        else
            rawFile = "/tmp/#{photo.id}"
            fs.openSync rawFile, 'w'
            stream = file.getBinary 'file', (err) ->
                return next err if err
            stream.pipe fs.createWriteStream rawFile
            stream.on 'error', next

            stream.on 'end', =>
                if not photo.binary.thumb?
                    thumbHelpers.resize rawFile, photo, 'thumb', (err) ->
                        return next err if err
                        thumbHelpers.resize rawFile, photo, 'screen', (err) ->
                            fs.unlink rawFile, ->
                                res.send 201, photo
                else if not photo.binary.screen?
                    thumbHelpers.resize rawFile, photo, 'screen', (err) ->
                        fs.unlink rawFile, ->
                            res.send 201, photo
