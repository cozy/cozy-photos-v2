ViewCollection = require 'lib/view_collection'
helpers = require 'lib/helpers'
FilesBrowser = require './browser'
PhotoView = require 'views/photo'
Photo = require 'models/photo'
photoprocessor = require 'models/photoprocessor'
app = require 'application'

# galery : collection of PhotoViews
module.exports = class Galery extends ViewCollection
    itemView: PhotoView

    template: require 'templates/galery'

    initialize: ->
        super
        # when the cover picture is deleted, we remove it from the album
        @listenTo @collection, 'destroy', @onPictureDestroyed

    # launch photobox after render
    afterRender: ->
        super
        @$el.photobox 'a.server',
            thumbs: true
            history: false
            beforeShow: @beforeImageDisplayed
        , @onImageDisplayed

        # Addition to photobox ui to give more control to the user.

        # Add button to return photo to left
        if $('#pbOverlay .pbCaptionText .btn-group').length is 0
            $('#pbOverlay .pbCaptionText')
                .append('<div class="btn-group"></div>')
        @turnLeft = $('#pbOverlay .pbCaptionText .btn-group .left')
        @turnLeft.unbind 'click'
        @turnLeft.remove()
        if navigator.userAgent.search("Firefox") isnt -1
            transform = "transform"
        else
            transform = "-webkit-transform"
        @turnLeft = $('<a id="left" class="btn left" type="button">
                       <i class="glyphicon glyphicon-share-alt glyphicon-reverted"
                        style="' + transform + ': scale(-1,1)"> </i> </a>')
            .appendTo '#pbOverlay .pbCaptionText .btn-group'
        @turnLeft.on 'click', @onTurnLeft

        # Add link to download photo
        @downloadLink = $('#pbOverlay .pbCaptionText  .btn-group .download-link')
        @downloadLink.unbind 'click'
        @downloadLink.remove()
        unless @downloadLink.length
            @downloadLink =
                $('<a class="btn download-link" download>
                  <i class="glyphicon glyphicon-arrow-down"></i></a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'

        @uploader = @$('#uploader')

        # Cover button to select cover
        @coverBtn = $('#pbOverlay .pbCaptionText .btn-group .cover-btn')
        @coverBtn.unbind 'click'
        @coverBtn.remove()
        @coverBtn = $('<a id="cover-btn" class="btn cover-btn">
                       <i class="glyphicon glyphicon-picture" </i> </a>')
            .appendTo '#pbOverlay .pbCaptionText .btn-group'
        @coverBtn.on 'click', @onCoverClicked

        # Add button to return photo to right
        @turnRight = $('#pbOverlay .pbCaptionText .btn-group .right')
        @turnRight.unbind 'click'
        @turnRight.remove()
        @turnRight = $('<a id="right" class="btn right">
                       <i class="glyphicon glyphicon-share-alt" </i> </a>')
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
            'click #browseFiles': 'displayBrowser'

    # event listeners for D&D events
    onFilesDropped: (evt) ->
        @$el.removeClass 'dragover'
        @handleFiles evt.dataTransfer.files
        evt.stopPropagation()
        evt.preventDefault()
        return false

    # Display orange background telling that drag is active.
    onDragOver: (evt) ->
        @$el.addClass 'dragover'
        evt.preventDefault()
        evt.stopPropagation()
        return false

    # Extract photo id from its URL. It's useful to get the id of the current
    # picture when the user browses them via photobox.
    getIdPhoto: (url) =>
        url ?= $('#pbOverlay .wrapper img.zoomable').attr 'src'
        parts = url.split('/')
        id = parts[parts.length - 1]
        id = id.split('.')[0]
        return id

    # Rotate 90° left the picture by updating css and orientation.
    onTurnLeft: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        newOrientation =
            helpers.rotateLeft orientation, $('.wrapper img.zoomable')
        helpers.rotate newOrientation, $('.wrapper img.zoomable')
        @collection.get(id)?.save orientation: newOrientation,
            success : () =>
                helpers.rotate newOrientation, $('.pbThumbs .active img')

    # Rotate 90° right the picture by updating css and orientation.
    onTurnRight: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        newOrientation =
            helpers.rotateRight orientation, $('.wrapper img.zoomable')
        helpers.rotate newOrientation, $('.wrapper img.zoomable')
        @collection.get(id)?.save orientation: newOrientation,
            success : () =>
                helpers.rotate newOrientation, $('.pbThumbs .active img')

    # When cover button is clicked, the current picture is set on the current
    # album as cover. Then information are saved.
    onCoverClicked: () =>
        @coverBtn.addClass 'disabled'
        photoId = @getIdPhoto()
        @album.set 'coverPicture', photoId
        @album.set 'thumb', photoId
        @album.set 'thumbsrc', @album.getThumbSrc()
        @album.save null,
            success: =>
                @coverBtn.removeClass 'disabled'
                alert t 'photo successfully set as cover'
            error: =>
                @coverBtn.removeClass 'disabled'
                alert t 'problem occured while setting cover'

    onPictureDestroyed: (destroyed) =>
        if destroyed.id is @album.get 'coverPicture'
            @album.save coverPicture: null

    onFilesChanged: (evt) =>
        @handleFiles @uploader[0].files
        # reset the iNput
        old = @uploader
        @uploader = old.clone true
        old.replaceWith @uploader

    beforeImageDisplayed: (link) =>
        id = @getIdPhoto link.href
        orientation = @collection.get(id)?.attributes.orientation
        $('#pbOverlay .wrapper img')[0].dataset.orientation = orientation

    onImageDisplayed: (args) =>
        # Initialize download link
        url = $('.pbThumbs .active img').attr 'src'
        id = @getIdPhoto()
        @downloadLink.attr 'href', url.replace 'thumbs', 'raws'

        # Rotate thumbs
        thumbs = $('#pbOverlay .pbThumbs img')
        for thumb in thumbs
            url = thumb.src
            parts = url.split('/')
            id = parts[parts.length - 1]
            id = id.split('.')[0]
            orientation = @collection.get(id)?.attributes.orientation
            helpers.rotate orientation, $(thumb)

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

    displayBrowser: ->
        new FilesBrowser
            model: @album
            collection: @collection
            beforeUpload: @options.beforeUpload