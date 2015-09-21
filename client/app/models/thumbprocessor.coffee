# Create an image node to get thumb prev data
readFile = (photo, next) ->

    photo.img = new Image()
    photo.img.onload = ->
        next()
    photo.img.src = photo.url


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
    setTimeout next, 1

# create photo.screen : a Blob(~File) copy of photo.screen_du
makeThumbBlob = (photo, next) ->
    photo.thumb = blobify photo.thumb_du, photo.file.type
    setTimeout next, 1


# create a FormData object with photo.file, photo.thumb, photo.screen
# save the model with these files
upload = (photo, next) ->
    formdata = new FormData()
    formdata.append 'thumb', photo.thumb, "thumb_#{photo.file.name}"
    $.ajax
        url: "photos/thumbs/#{photo.id}.jpg"
        data: formdata
        cache: false
        contentType: false
        processData: false
        type: 'PUT',
        success: (data) ->
            $("#rebuild-th").append "<p>#{photo.file.name} photo updated.</p>"



# make thumb and upload
uploadWorker = (photo, done) ->
    async.waterfall [
        (cb) -> readFile          photo, cb
        (cb) -> makeThumbDataURI photo, cb
        (cb) -> makeThumbBlob     photo, cb
        (cb) -> upload            photo, cb
        (cb) ->
            delete photo.img
            delete photo.thumb
            delete photo.thumb_du
            cb()
    ], (err) ->
        done(err)


class ThumbProcessor

    # upload 2 by 2
    uploadQueue: async.queue uploadWorker, 2

    process: (model) ->

        photo =
            url: model.getPrevSrc()
            id: model.get 'id'
            file:
                type: 'image/jpeg'
                name: model.get 'title'

        #setTimeout =>
            #@uploadQueue.push photo, (err) =>
                #return console.log err if err
        #, 300
        uploadWorker photo, (err) ->
            console.log err if err


module.exports = new ThumbProcessor()
