File = require '../models/file'
Photo = require '../models/photo'
async = require 'async'
fs = require 'fs'
im = require 'imagemagick'

# Get given photo, returns 404 if photo is not found.
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
                date = "#{date.getFullYear()}-#{date.getMonth()+1}"
                if dates[date]?
                    dates[date].push photo
                else
                    dates[date] = [photo]
            res.send dates, 201


doPipe = (req, which, res) ->

    request = req.file.getBinary "file", (err) ->
        if err
            options =
                encoding: 'base64'
            stream = fs.createReadStream "/home/zoe/Documents/Cozy_Cloud/cozy-photos/server/helpers/error.gif", options
            stream.pipe res
            #if err then res.error 500, "File fetching failed.", err

    # This is a temporary hack to allow caching
    # ideally, we would do as follow :
    # request.headers['If-None-Match'] = req.headers['if-none-match']
    # but couchdb goes 500 (COUCHDB-1697 ?)
    request.pipefilter = (couchres, myres) ->
        if couchres.headers.etag is req.headers['if-none-match']
            myres.send 304

    request.pipe res

# Get a small size of the picture.
module.exports.thumb = (req, res) ->
    doPipe req, 'thumb', res

module.exports.createPhoto = (req, res, next) ->
    file = req.file
    photo =
        date         : file.lastModification
        title        : ""
        description  : ""
        orientation  : 1
        binary       : file.binary
        albumid      : "#{req.body.albumid}"
    if not file.binary?
        next "Binary doesn't exist"
    else
        File.find file.binary.id, (err, binary) ->
    Photo.create photo, (err, photo) ->
        return next err if err
        tmp = "/tmp/#{photo.id}"
        fs.openSync tmp, 'w'
        tmp2 = "/tmp/#{photo.id}2"
        fs.openSync tmp2, 'w'
        stream = file.getBinary 'file', (err, res) =>
            return next err if err
        out = fs.createWriteStream(tmp)
        stream.pipe(out)
        stream.on 'end', () =>
            im.resize
                srcPath: tmp,
                dstPath: tmp2,
                width:   300,
                height: 300
            , (err, stdout, stderr) =>
                next err if err?
                photo.attachBinary tmp2, name:'thumb', (err) =>
                    next err if err?
                    fs.unlink tmp
                    fs.unlink tmp2
                    res.send photo, 201