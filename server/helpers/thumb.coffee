fs = require 'fs'
im = require 'imagemagick'
mime = require 'mime'
log = require('printit')
    prefix: 'thumbnails'


whiteList = [
    'image/jpeg'
    'image/png'
]

module.exports = thumb =
    resize: (raw, file, name, callback) ->
        options =
            mode: 'crop'
            width: 300
            height: 300

        options.srcPath = raw
        options.dstPath = "/tmp/2-#{file.name}"

        # create files
        fs.openSync options.dstPath, 'w'

        # create a resized file and push it to db
        try
            im[options.mode] options, (err, stdout, stderr) =>
                return callback err if err
                file.attachBinary options.dstPath, {name}, (err) ->
                    fs.unlink options.dstPath, (unlinkErr) ->
                        console.log unlinkErr if err
                        callback err
        catch err
            console.log err
            callback err


    create: (file, callback) ->
        return callback new Error('no binary') unless file.binary?

        if file.binary?.thumb?
            log.info "createThumb #{file.id} / #{file.name}: already created."
            callback()

        else
            mimetype = mime.lookup file.name

            if mimetype not in whiteList
                log.info """
createThumb: #{file.id} / #{file.name}: No thumb to create for this kind of
file.
    """
                callback()

            else
                rawFile = "/tmp/#{file.name}"
                stream = file.getBinary 'file', (err) ->
                    return callback err if err
                stream.pipe fs.createWriteStream rawFile
                stream.on 'error', callback
                stream.on 'end', =>
                    thumb.resize rawFile, file, 'thumb', (err) =>
                        fs.unlink rawFile, ->
                            log.info """
createThumb #{file.id} / #{file.name}: Thumbnail created
"""
                            callback err
