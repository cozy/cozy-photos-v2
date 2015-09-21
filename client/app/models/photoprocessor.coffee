# read the file from photo.file using a FileReader
# create photo.img : an Image object
readFile = (photo, next) ->
    if photo.file.size > 10 * 1024 * 1024
        return next t 'is too big (max 10Mo)'

    if not photo.file.type.match /image\/.*/
        return next t 'is not an image'

    reader = new FileReader()
    photo.img = new Image()

    reader.readAsDataURL photo.file
    reader.onloadend = ->
        photo.img.src = reader.result
        photo.img.orientation = photo.attributes.orientation
        photo.img.onload = ->
            next()


# resize an image into given dimensions
# if fill, the image will be croped to fit in new dim
resize = (photo, MAX_WIDTH, MAX_HEIGHT, fill) ->

    max = width: MAX_WIDTH, height: MAX_HEIGHT
    if (photo.img.width > photo.img.height) is fill
        ratiodim = 'height'
    else
        ratiodim = 'width'

    ratio = max[ratiodim] / photo.img[ratiodim]

    newdims =
        height: ratio * photo.img.height
        width: ratio * photo.img.width

    # use canvas to resize the image
    canvas = document.createElement 'canvas'
    canvas.width  = if fill then MAX_WIDTH  else newdims.width
    canvas.height = if fill then MAX_HEIGHT else newdims.height
    ctx = canvas.getContext '2d'
    ctx.drawImage photo.img, 0, 0, newdims.width, newdims.height
    return canvas.toDataURL photo.file.type


# transform a dataUrl into a Blob
blobify = (dataUrl, type) ->
    binary = atob dataUrl.split(',')[1]
    array = []
    for i in [0..binary.length]
        array.push binary.charCodeAt i
    return new Blob [new Uint8Array(array)], type: type


# create photo.thumb_du : a DataURL encoded thumbnail of photo.img
makeThumbDataURI = (photo, next) ->
    photo.thumb_du = resize photo, 300, 300, true

    photo.trigger 'thumbed'
    next()


# create photo.screen_du : a DataURL encoded thumbnail of photo.img
makeScreenDataURI = (photo, next) ->
    photo.screen_du = resize photo, 1200, 800, false
    next()


# create photo.thumb : a Blob(~File) copy of photo.thumb_du
makeScreenBlob = (photo, next) ->
    photo.thumb = blobify photo.thumb_du, photo.file.type
    next()


# create photo.screen : a Blob(~File) copy of photo.screen_du
makeThumbBlob = (photo, next) ->
    photo.screen = blobify photo.screen_du, photo.file.type
    next()


# create a FormData object with photo.file, photo.thumb, photo.screen
# save the model with these files
upload = (photo, next) ->
    formdata = new FormData()
    for attr in ['title', 'description', 'albumid', 'orientation']
        formdata.append attr, photo.get attr

    formdata.append 'raw', photo.file
    formdata.append 'thumb', photo.thumb, "thumb_#{photo.file.name}"
    formdata.append 'screen', photo.screen, "screen_#{photo.file.name}"

    # need to call sync directly so we can change the data
    Backbone.sync 'create', photo,
        contentType: false # Prevent $.ajax from being smart
        data: formdata
        success: (data) ->
            photo.set photo.parse(data), silent: true
            next()
        error: ->
            next t ' : upload failled' # clear tmps anyway
        xhr: -> # add progress listener to XHR
            xhr = $.ajaxSettings.xhr()
            progress = (e) -> photo.trigger 'progress', e

            if xhr instanceof window.XMLHttpRequest
                xhr.addEventListener 'progress', progress, false
            if xhr.upload
                xhr.upload.addEventListener 'progress', progress, false
            xhr


# make screen sized version and upload
uploadWorker = (photo, done) ->
    async.waterfall [
        (cb) -> readFile          photo, cb
        (cb) -> makeThumbDataURI photo, cb
        (cb) -> makeScreenDataURI photo, cb
        (cb) -> makeScreenBlob    photo, cb
        (cb) -> makeThumbBlob     photo, cb
        (cb) -> upload            photo, cb
        (cb) ->
            # the photo is now backed by the server
            # delete all object attached to the photo
            delete photo.file
            delete photo.img
            delete photo.thumb
            delete photo.thumb_du
            delete photo.scren
            delete photo.screen_du
            setTimeout cb, 200
    ], (err) ->
        if err
            photo.trigger 'upError', err
        else
            photo.trigger 'uploadComplete'

        done err


class PhotoProcessor

    # upload 2 by 2
    uploadQueue: async.queue uploadWorker, 2

    process: (photo) ->
        @uploadQueue.push photo, (err) ->
            return console.log err if err

module.exports = new PhotoProcessor()
