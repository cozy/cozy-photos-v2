MAX_WIDTH = MAX_HEIGHT = 100

module.exports = class Photo extends Backbone.Model

    defaults: ->
        title:'noname'

    sync: (method, model, options) ->
        if method is 'create'
            formdata = new FormData()
            formdata.append 'raw', @file
            formdata.append 'thumb', @thumb, "thumb_#{@file.name}"
            for key, value of @toJSON()
                formdata.append key, value

            options.data = formdata
            options.contentType = false

        super method, model, options

    readFile: (next) =>
        reader = new FileReader()
        @img = new Image()
        reader.readAsDataURL @file
        reader.onloadend = =>
            @file_du = reader.result
            @img.src = reader.result
            @img.onload = ->
                next()

    makeThumbDataURI: (next) =>
        width = @img.width
        height = @img.height
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
        ctx.drawImage @img, 0, 0, newWidth, newHeight
        @thumb_du = canvas.toDataURL 'image/jpeg'
        @img = null

        next()

    makeThumbBlob: (next) =>
        # convert the dataURI back to a file (Blob)
        binary = atob @thumb_du.split(',')[1]
        array = []
        for i in [0..binary.length]
          array.push binary.charCodeAt i
        @thumb = new Blob [new Uint8Array(array)], type: 'image/jpeg'

        next()

    doUpload: (file, done) ->
        @file = file
        @readFile =>
            @makeThumbDataURI =>
                @makeThumbBlob =>
                    @save null,
                        success: =>
                            delete @file
                            delete @file_du
                            delete @thumb
                            delete @thumb_du
                            done()

        return this