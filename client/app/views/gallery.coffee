ViewCollection = require 'lib/view_collection'
helpers = require 'lib/helpers'
PhotoView = require 'views/photo'
Photo = require 'models/photo'
photoprocessor = require 'models/photoprocessor'
app = require 'application'

# gallery : collection of PhotoViews
module.exports = class Gallery extends ViewCollection
    itemView: PhotoView

    template: require 'templates/gallery'

    # launch photobox after render
    afterRender: ->
        super
        @$el.photobox 'a.server',
            thumbs: true
            history: false
        , @onImageDisplayed

        # Add button to return photo to left
        if $('#pbOverlay .pbCaptionText .btn-group').length is 0
            $('#pbOverlay .pbCaptionText')
                .append('<div class="btn-group"></div>')
        @turnLeft = $('#pbOverlay .pbCaptionText .btn-group .left')
        @turnLeft.unbind 'click'
        @turnLeft.remove()
        @turnLeft = $('<a id="left" class="btn left" type="button">
                       <i class="icon-share-alt"
                        style="transform: scale(-1,1)"> </i> </a>')
            .appendTo '#pbOverlay .pbCaptionText .btn-group'
        @turnLeft.on 'click', @onTurnLeft

        # Add link to download photo

        @downloadLink = $('#pbOverlay .pbCaptionText  .btn-group .download-link')
        @downloadLink.unbind 'click'
        @downloadLink.remove()
        unless @downloadLink.length
            @downloadLink =
                $('<a class="btn download-link" download>
                  <i class="icon-arrow-down"></i></a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'

        @uploader = @$('#uploader')

        # Add button to return photo to right
        @turnRight = $('#pbOverlay .pbCaptionText .btn-group .right')
        @turnRight.unbind 'click'
        @turnRight.remove()
        @turnRight = $('<a id="right" class="btn right">
                       <i class="icon-share-alt" </i> </a>')
            .appendTo '#pbOverlay .pbCaptionText .btn-group'
        @turnRight.on 'click', @onTurnRight


    checkIfEmpty: =>
        @$('.help').toggle _.size(@views) is 0 and app.mode is 'public'

    # D&D events
    events: ->
        if @options.editable
            'drop'     : 'onFilesDropped'
            'dragover' : 'onDragOver'
            'change #uploader': 'onFilesChanged'

    # event listeners for D&D events
    onFilesDropped: (evt) ->
        @$el.removeClass 'dragover'
        @handleFiles evt.dataTransfer.files
        evt.stopPropagation()
        evt.preventDefault()
        return false

    onDragOver: (evt) ->
        @$el.addClass 'dragover'
        evt.preventDefault()
        evt.stopPropagation()
        return false

    getIdPhoto: () =>
        url = $('.imageWrap img').attr 'src'
        id = url.split('/')[4]
        id = id.split('.')[0]
        return id

    onTurnLeft: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        newOrientation =
            helpers.rotateLeft orientation, $('.imageWrap img')
        helpers.rotate newOrientation, $('.imageWrap img')
        @collection.get(id)?.save orientation: newOrientation
        # Update thumb
        thumbs = $('#pbOverlay .pbThumbs img')
        for thumb in thumbs
            url = thumb.src
            idThumb = url.split('/')[5]
            idThumb = idThumb.split('.')[0]
            if idThumb is id
                thumb.style = helpers.getRotate newOrientation

    onTurnRight: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        newOrientation =
            helpers.rotateRight orientation, $('.imageWrap img')
        helpers.rotate newOrientation, $('.imageWrap img')
        @collection.get(id)?.save orientation: newOrientation
        # Update thumb
        thumbs = $('#pbOverlay .pbThumbs img')
        for thumb in thumbs
            url = thumb.src
            idThumb = url.split('/')[5]
            idThumb = idThumb.split('.')[0]
            if idThumb is id
                thumb.style = helpers.getRotate newOrientation


    onFilesChanged: (evt) =>
        @handleFiles @uploader[0].files
        # reset the input
        old = @uploader
        @uploader = old.clone true
        old.replaceWith @uploader

    onImageDisplayed: =>
        console.log "hello"
        url = $('.pbThumbs .active img').attr 'src'
        console.log url
        setTimeout =>
            # Initialize download link
            url = $('.imageWrap img').attr 'src'
            id = @getIdPhoto()
            url = "photos/raws/#{id}"
            @downloadLink.attr 'href', url

            # Rotate image displayed
            orientation = @collection.get(id)?.attributes.orientation
            helpers.rotate orientation, $('.imageWrap img')

            # Rotate thumbs
            #thumbs = $('#pbOverlay .pbThumbs img')
            #for thumb in thumbs
                #url = thumb.src
                #id = url.split('/')[5]
                #id = id.split('.')[0]
                #orientation = @collection.get(id)?.attributes.orientation
                #thumb.style = helpers.getRotate orientation
        , 2000


    handleFiles: (files) ->
        # allow parent view to set some attributes on the photo
        # (current usage = albumid + save album if it is new)
        @options.beforeUpload (photoAttributes) =>
            for file in files
                photoAttributes.title = file.name
                photo = new Photo photoAttributes
                photo.file = file
                @collection.add photo

                photoprocessor.process photo
