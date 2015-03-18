fs = require 'fs'
gm = require 'gm'
mime = require 'mime'
log = require('printit')
    prefix: 'thumbnails'


# Mimetype that requires thumbnail generation. Other types are not supported.
whiteList = [
    'image/jpeg'
    'image/png'
]


module.exports = thumb =


    # Returns orientation and date creation information through an object of
    # this form
    # { exif: { orientation: 1, date: "2015-01-23T10:18:26+01:00" }}
    readMetadata: (filePath, callback) ->
        gm(filePath)
        .options
            imageMagick: true
        .identify (err, data) ->

            if err
                callback err
            else
                orientation = data.Orientation

                if not(orientation?) or data.Orientation is 'Undefined'
                    orientation = 1

                metadata =
                    exif:
                        orientation: orientation
                        date: data.Properties['date:create']

                callback null, metadata


    # Attach given binary to given file. `name` is the binary field that will
    # store file content.
    attachFile: (file, dstPath, name, callback) ->
        file.attachBinary dstPath, {name}, (err) ->
            fs.unlink dstPath, (unlinkErr) ->
                console.log unlinkErr if err
                callback err


    # Resize given file/photo and save it as binary attachment to given file.
    # Resizing depends on target attachment name. If it's 'thumb', it cropse
    # the image to a 300x300 image. If it's a 'scree' preview, it is resize
    # as a 1200 x 800 image.
    resize: (srcPath, file, name, callback) ->
        dstPath = "/tmp/2-#{file.id}"

        try
            attachFile = (err) =>
                if err
                    callback err
                else

            gmRunner = gm(srcPath).options(imageMagick: true)

            if name is 'thumb'
                buildThumb = (width, height) ->
                    gmRunner
                    .resize(width, height)
                    .crop(300, 300, 0, 0)
                    .write dstPath, (err) ->
                        if err
                            callback err
                        else
                            thumb.attachFile file, dstPath, name, callback

                gmRunner.size (err, data) ->
                    if err
                        callback err
                    else
                        if data.width > data.height
                            buildThumb null, 300
                        else
                            buildThumb 300, null

            else if name is 'screen'
                gmRunner.resize(1200, 800)
                .write dstPath, (err) ->
                    if err
                        callback err
                    else
                        thumb.attachFile file, dstPath, name, callback

        catch err
            console.log err
            callback err
