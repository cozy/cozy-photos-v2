Photo = require 'models/photo'

# width and height of generated thumbs
MAX_WIDTH = MAX_HEIGHT = 100

# read the file from photo.file using a FileReader
# create photo.img : an Image
# next : callback when the file have been read

readFile = (photo, next) ->
    reader = new FileReader()
    photo.img = new Image()
    reader.readAsDataURL photo.file
    reader.onloadend = =>
        photo.file_du = reader.result
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
    photo.thumb_du = canvas.toDataURL 'image/jpeg'

    # let the view update itself
    photo.trigger 'change'

    # free memory
    delete photo.img

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
      success: -> next()
      data: formdata


# delete all object attached to the photo
# the photo is now backed by the server
clearTemp = (photo, next) ->
    delete photo.file
    delete photo.img
    delete photo.file_du
    delete photo.thumb
    delete photo.thumb_du
    next()


# async waterfall of all the above
operation = (task , callback) ->
    {photo, file} = task
    photo.file = file
    async.waterfall [
        (cb) -> readFile photo         , cb
        (cb) -> makeThumbDataURI photo , cb
        (cb) -> makeThumbBlob photo    , cb
        (cb) -> upload photo           , cb
        (cb) -> clearTemp Photo        , cb
    ], callback

# number of pictures being processed at any time
concurrency = 3

queue = async.queue operation, concurrency

module.exports.process = (file, photo) ->
    queue.push
        file: file
        photo: photo
    , ->