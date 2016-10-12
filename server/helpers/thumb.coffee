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

# Convert degree, minutes, secondes into position x and y
gpsDegToDec = (pos, posRef) -> # String to int

    split = pos.match /(\d+)\/(\d+), (\d+)\/(\d+), (\d+)\/(\d+)/
    if split?[6]
        coord    =  split[1] / split[2] + \
                   (split[3] / split[4]) / 60 + \
                   (split[5] / split[6])/3600 # lat and long format
    else
        splitAlt = pos.match /(\d+)\/(\d+)/   # altitude format
        if splitAlt?
            coord    = splitAlt[1] / splitAlt[2]
    ref = if (posRef == 'S' or posRef == 'W') then -1 else 1
    if coord?
        return ref * coord

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

                alt  = 'exif:GPSAltitude'
                lat  = 'exif:GPSLatitude'
                long = 'exif:GPSLongitude'
                GPS  = {}

                if data.Properties[ alt  ]
                    GPS.alt  = gpsDegToDec data.Properties[alt] , data.Properties[alt  + 'Ref']
                if data.Properties[ lat ]
                    GPS.lat  = gpsDegToDec data.Properties[lat] , data.Properties[lat  + 'Ref']
                if data.Properties[ long ]
                    GPS.long = gpsDegToDec data.Properties[long], data.Properties[long + 'Ref']

                if not(orientation?) or data.Orientation is 'Undefined'
                    orientation = 1
                metadata =
                    exif:
                        orientation:    orientation
                        # From Exif 2.2 specs :
                        # DateTimeOriginal - Date of the original creation of data
                        # DateTimeDigitized - Date of the digitization of data
                        # DateTime - Modification date of the file
                        # In case of a raw photo 3 should be the same
                        # In case of a retouched photo DateTimeOriginal should be the date of the shot, DateTime the retouching date.
                        # Fallback to creation date if  no exif.
                        date:           data.Properties['exif:DateTimeOriginal'] ? data.Properties['exif:DateTimeDigitized'] ? data.Properties['exif:DateTime'] ? data.Properties['date:create']
                        gps:            GPS

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
            attachFile = (err) ->
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
