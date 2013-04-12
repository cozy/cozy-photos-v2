Photo = require 'models/photo'

# width and height of generated thumbs
MAX_WIDTH = MAX_HEIGHT = 100
TYPEREGEX = ///image/.*///

# read the file from photo.file using a FileReader
# create photo.img : an Image

readFile = (photo, next) ->
    if photo.file.size > 6*1024*1024
        return next('too big')

    if not photo.file.type.match TYPEREGEX
        return next('not an image')

    reader = new FileReader()
    photo.img = new Image()
    reader.readAsDataURL photo.file
    reader.onloadend = =>
        photo.img.src = reader.result
        photo.img.onload = ->
            next()

# create photo.thumb_du : a DataURL encoded thumbnail of photo.img
makeThumbDataURI = (photo, next) ->
    width = photo.img.width
    height = photo.img.height
    if width > height and height > MAX_HEIGHT
        newWidth = width * MAX_HEIGHT / height
        newHeight = MAX_HEIGHT
    else if width > MAX_WIDTH
        newWidth = MAX_WIDTH
        newHeight = height * MAX_WIDTH / width

    # use canvas to resize the image
    canvas = document.createElement 'canvas'
    canvas.width = MAX_WIDTH
    canvas.height = MAX_HEIGHT
    ctx = canvas.getContext '2d'
    ctx.drawImage photo.img, 0, 0, newWidth, newHeight
    photo.thumb_du = canvas.toDataURL photo.file.type

    # let the view update itself
    photo.set 'thumbsrc', photo.thumb_du

    next()

# create photo.thumb : a Blob(~File) copy of photo.thumb_du
makeThumbBlob = (photo, next) ->
    binary = atob photo.thumb_du.split(',')[1]
    array = []
    for i in [0..binary.length]
        array.push binary.charCodeAt i
    photo.thumb = new Blob [new Uint8Array(array)], type: 'image/jpeg'

    next()


# create a FormData object with photo.file and photo.thumb
# save the model with these files
upload = (photo, next) ->
    formdata = new FormData()
    formdata.append 'raw', photo.file
    formdata.append 'thumb', photo.thumb, "thumb_#{photo.file.name}"
    for key, value of photo.toJSON()
        formdata.append key, value

    Backbone.sync 'create', photo,
      contentType: false # Prevent $.ajax from being smart
      success: ->
            next()
      error: ->
            photo.set 'thumbsrc', 'img/error.gif'
            next() # clear tmps anyway
      data: formdata

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
                thumbsrc:'img/error.gif'
                title: photo.get('title') + ' is ' + err
        done(err)

uploadWorker = (photo, done) ->
    async.waterfall [
        (cb) -> makeThumbBlob    photo, cb
        (cb) -> upload           photo, cb
        (cb) ->
            # the photo is now backed by the server
            # delete all object attached to the photo
            delete photo.file
            delete photo.thumb
            delete photo.thumb_du
            cb()
    ], (err) ->
        if err
            photo.set
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
