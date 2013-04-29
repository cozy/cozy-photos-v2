Photo = require 'models/photo'

# read the file from photo.file using a FileReader
# create photo.img : an Image

readFile = (photo, next) ->
    if photo.file.size > 10*1024*1024
        return next('too big (max 10Mo)')

    if not photo.file.type.match /image\/.*/
        return next('not an image')

    reader = new FileReader()
    photo.img = new Image()
    reader.readAsDataURL photo.file
    reader.onloadend = =>
        photo.img.src = reader.result
        photo.img.onload = ->
            next()

resize = (photo, MAX_WIDTH, MAX_HEIGHT, fill) ->

    max = width: MAX_WIDTH, height:MAX_HEIGHT
    if (photo.img.width > photo.img.height) is fill
        ratiodim = 'height'
    else
        ratiodim = 'width'

    ratio = max[ratiodim] / photo.img[ratiodim]

    newdims =
        height: ratio*photo.img.height
        width: ratio*photo.img.width


    # use canvas to resize the image
    canvas = document.createElement 'canvas'
    canvas.width = if fill then MAX_WIDTH else newdims.width
    canvas.height = if fill then MAX_HEIGHT else newdims.height
    ctx = canvas.getContext '2d'
    ctx.drawImage photo.img, 0, 0, newdims.width, newdims.height
    return canvas.toDataURL photo.file.type

blobify = (dataUrl, type) ->
    binary = atob dataUrl.split(',')[1]
    array = []
    for i in [0..binary.length]
        array.push binary.charCodeAt i
    return new Blob [new Uint8Array(array)], type: type


# create photo.thumb_du : a DataURL encoded thumbnail of photo.img
makeThumbDataURI = (photo, next) ->

    photo.thumb_du = resize photo, 100, 100, true
    # let the view update itself
    photo.set
        state: 'thumbed'
        thumbsrc: photo.thumb_du

    next()

# create photo.screen_du : a DataURL encoded thumbnail of photo.img
makeScreenDataURI = (photo, next) ->

    photo.screen_du = resize photo, 1200, 800, false

    next()

# create photo.thumb : a Blob(~File) copy of photo.thumb_du
makeScreenBlob = (photo, next) ->

    photo.thumb = blobify photo.thumb_du, photo.file.type

    next()

# create photo.screen : a Blob(~File) copy of photo.scren_du
makeThumbBlob = (photo, next) ->

    photo.screen = blobify photo.screen_du, photo.file.type

    next()


# create a FormData object with photo.file and photo.thumb
# save the model with these files
upload = (photo, next) ->
    formdata = new FormData()
    formdata.append 'cid', photo.cid
    formdata.append 'title', photo.get 'title'
    formdata.append 'description', photo.get 'description'
    formdata.append 'albumid', photo.get 'albumid'
    formdata.append 'raw', photo.file
    formdata.append 'thumb', photo.thumb, "thumb_#{photo.file.name}"
    formdata.append 'screen', photo.screen, "screen_#{photo.file.name}"

    # need to call sync directly so we can change the data
    Backbone.sync 'create', photo,
        contentType: false # Prevent $.ajax from being smart
        data: formdata
        success: (data) ->
            photo.set photo.parse(data)
            next()
        error: ->
            photo.set
                state: 'error'
                thumbsrc: 'img/error.gif'
                title: photo.get('title') + ': upload failed'
            next() # clear tmps anyway

# async waterfall of all the above
makeThumbWorker = (photo , done) ->
    async.waterfall [
        (cb) -> readFile         photo, cb
        (cb) -> makeThumbDataURI photo, cb
        (cb) ->
            delete photo.img
            cb()
    ], (err) ->
        if err
            photo.set
                state: error
                thumbsrc: 'img/error.gif'
                title: photo.get('title') + ' is ' + err
        done(err)

uploadWorker = (photo, done) ->
    async.waterfall [
        (cb) -> readFile          photo, cb
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
            cb()
    ], (err) ->
        if err
            photo.set
                state: error
                thumbsrc:'img/error.gif'
                title: photo.get('title') + ' is ' + err
        done(err)


class PhotoProcessor

    # create thumbs 3 by 3
    thumbsQueue: async.queue makeThumbWorker, 3

    # upload 2 by 2
    uploadQueue: async.queue uploadWorker, 2

    process: (photo) ->
        @thumbsQueue.push photo, (err) =>
            return console.log err if err
            @uploadQueue.push photo, (err) =>
                return console.log err if err

module.exports = new PhotoProcessor()
