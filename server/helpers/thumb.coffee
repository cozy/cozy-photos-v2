fs = require 'fs'
im = require 'imagemagick'

resize = (raw, file, name, callback) ->
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


module.exports.create = (file, callback) ->
    console.log "createThumb #{file.id}"
    return callback new Error('no binary') unless file.binary?
    if file.binary?.thumb?
        callback()
    else
        rawFile = "/tmp/#{file.id}"
        fs.openSync rawFile, 'w'
        stream = file.getBinary 'file', (err) ->
            return callback err if err
        stream.pipe fs.createWriteStream rawFile
        stream.on 'error', callback
        stream.on 'end', =>
            resize rawFile, file, 'thumb', (err) ->
                return callback err if err
                fs.unlink rawFile, ->
                    callback()