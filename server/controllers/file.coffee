File = require '../models/file'
Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
im = require 'imagemagick'

# Get given file, returns 404 if photo is not found.
module.exports.fetch = (req, res, next, id) ->
    id = id.substring 0, id.length - 4 if id.indexOf('.jpg') > 0
    File.find id, (err, file) =>
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'File not found' if not file

        req.file = file
        next()

module.exports.list = (req, res, next) ->
    dates = {}
    File.imageByDate (err, photos) =>
        if err
            return res.error 500, 'An error occured', err
        else
            for photo in photos
                date = new Date(photo.lastModification)
                mounth = date.getMonth() + 1
                mounth = if mounth > 9 then "#{mounth}" else "0#{mounth}"
                date = "#{date.getFullYear()}-#{mounth}"
                if dates[date]?
                    dates[date].push photo
                else
                    dates[date] = [photo]
            res.send dates, 201

module.exports.thumb = (req, res, next) ->
    which = if req.file.binary.thumb then 'thumb' else 'file'
    stream = req.file.getBinary which, (err) ->
        return next err if err
    stream.pipe res


resize = (raw, photo, name, callback) ->

    options = if name is 'thumb'
        mode: 'crop'
        width: 300
        height: 300

    else #screen
        mode: 'resize'
        width: 1200
        height: 800

    options.srcPath = raw
    options.dstPath = "/tmp/#{photo.id}2"

    # create files
    fs.openSync options.dstPath, 'w'

    # create a resized file and push it to db
    im[options.mode] options, (err, stdout, stderr) =>
        return callback err if err
        photo.attachBinary options.dstPath, {name}, (err) ->
            fs.unlink options.dstPath, ->
                callback err

module.exports.createPhoto = (req, res, next) ->
    file = req.file

    return next new Error('no binary') unless file.binary?

    photo =
        date         : file.lastModification
        title        : ""
        description  : ""
        orientation  : 1
        albumid      : "#{req.body.albumid}"

    Photo.create photo, (err, photo) ->
        return next err if err

        rawFile = "/tmp/#{photo.id}"
        fs.openSync rawFile, 'w'
        stream = file.getBinary 'file', (err) ->
            return next err if err
        stream.pipe fs.createWriteStream rawFile
        stream.on 'error', next
        stream.on 'end', =>
            photo.attachBinary rawFile, name: 'raw', (err) ->
                return next err if err
                resize rawFile, photo, 'thumb', (err) ->
                    return next err if err
                    resize rawFile, photo, 'screen', (err) ->
                        fs.unlink rawFile, ->
                            res.send 201, photo


