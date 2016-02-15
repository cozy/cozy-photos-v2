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

    # D&D events
    events: ->
        'drop'     : 'onFilesDropped'
        'dragover' : 'onDragOver'
        'dragleave' : 'onDragLeave'
        # change isn't fired on first click ???
        #'change #uploader': 'onFilesChanged'
        'click #uploader': 'onFilesClick'
        'click #browse-files': 'displayBrowser'


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
            zoomable: false
            beforeShow: @beforeImageDisplayed
            afterClose: @onAfterClosed
        , @onImageDisplayed

        # Addition to photobox ui to give more control to the user.

        if $('#pbOverlay .pbCaptionText .btn-group').length is 0
            $('#pbOverlay .pbCaptionText')
                .append('<div class="btn-group"></div>')
        # Add button to return photo to left
        if app.mode isnt 'public'
            @turnLeft = $('#pbOverlay .pbCaptionText .btn-group .left')
            @turnLeft.unbind 'click'
            @turnLeft.remove()
            if navigator.userAgent.search("Firefox") isnt -1
                transform = "transform"
            else
                transform = "-webkit-transform"
            @turnLeft = $('<a id="left" class="btn left" type="button">
                         <i class="fa fa-undo"> </i> </a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'
            @turnLeft.on 'click', @onTurnLeft

            # Add button to return photo to right
            @turnRight = $('#pbOverlay .pbCaptionText .btn-group .right')
            @turnRight.unbind 'click'
            @turnRight.remove()
            @turnRight = $('<a id="right" class="btn right">
                           <i class="fa fa-repeat" </i> </a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'
            @turnRight.on 'click', @onTurnRight



            # Cover button to select cover
            @coverBtn = $('#pbOverlay .pbCaptionText .btn-group .cover-btn')
            @coverBtn.unbind 'click'
            @coverBtn.remove()
            @coverBtn = $('<a id="cover-btn" class="btn cover-btn">
                           <i class="fa fa-star" </i> </a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'
            @coverBtn.on 'click', @onCoverClicked

            # Add button to delete photo
            @trashBtn = $('#pbOverlay .pbCaptionText .btn-group .trash-btn')
            @trashBtn.unbind 'click'
            @trashBtn.remove()
            @trashBtn = $('<a id="trash-btn" class="btn trash-btn">
                           <i class="fa fa-trash" </i> </a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'
            @trashBtn.on 'click', @onTrashClicked


        # Add link to download photo
        @downloadLink = $('#pbOverlay .pbCaptionText .btn-group .download-link')
        @downloadLink.unbind 'click'
        @downloadLink.remove()
        unless @downloadLink.length
            @downloadLink =
                $('<a class="btn download-link" download>
                  <i class="fa fa-download"></i></a>')
                .appendTo '#pbOverlay .pbCaptionText .btn-group'

        @uploader = @$('#uploader')


        if app.mode isnt 'public'
            for key, view of @views
                view.collection = @collection


    checkIfEmpty: =>
        @$('.help').toggle _.size(@views) is 0 and app.mode is 'public'


    # event listeners for D&D events
    onFilesDropped: (evt) ->
        if @options.editable
            @$el.removeClass 'dragover'
            @handleFiles evt.dataTransfer.files
            evt.stopPropagation()
            evt.preventDefault()
        return false


    # Display orange background telling that drag is active.
    onDragOver: (evt) ->
        if @options.editable
            @$el.addClass 'dragover'
            evt.preventDefault()
            evt.stopPropagation()
        return false


    onDragLeave: (evt) ->
        if @options.editable
            @$el.removeClass 'dragover'
            evt.preventDefault()
            evt.stopPropagation()
        return false


    # Extract photo id from its URL. It's useful to get the id of the current
    # picture when the user browses them via photobox.
    getIdPhoto: (url) ->
        url ?= $('#pbOverlay .wrapper img').attr 'src'
        parts = url.split('/')
        id = parts[parts.length - 1]
        id = id.split('.')[0]
        # if collection has not been saved, we must search by url
        if not @collection.get(id)?
            photo = @collection.find (e) ->
                return e.attributes.src.split('/').pop().split('.')[0] is id
            if photo?
                id = photo.cid
        return id


    # Rotate 90° left the picture by updating css and orientation.
    # Save result to Cozy database.
    onTurnLeft: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        orientation = 1 unless orientation?
        newOrientation =
            helpers.rotateLeft orientation, $('.wrapper img')
        helpers.rotate newOrientation, $('.wrapper img')
        @collection.get(id)?.save orientation: newOrientation,
            success : () ->
                helpers.rotate newOrientation, $('.pbThumbs .active img')


    # Rotate 90° right the picture by updating css and orientation.
    onTurnRight: () =>
        id = @getIdPhoto()
        orientation = @collection.get(id)?.attributes.orientation
        newOrientation =
            helpers.rotateRight orientation, $('.wrapper img')
        helpers.rotate newOrientation, $('.wrapper img')
        @collection.get(id)?.save orientation: newOrientation,
            success : () ->
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
        # reset the input
        old = @uploader
        @uploader = old.clone true
        old.replaceWith @uploader


    onFilesClick: (evt) ->
        element = document.getElementById('uploader')
        element.addEventListener 'change', @onFilesChanged


    # When trash button is clicked it proposes to delete the currently
    # displayed picture. It asks for a confirmation before
    onTrashClicked: =>
        if confirm t 'photo delete confirm'
            photo = @collection.get(@getIdPhoto())
            photo.destroy()


    beforeImageDisplayed: (link) =>
        id = @getIdPhoto link.href
        orientation = @collection.get(id)?.attributes.orientation
        $('#pbOverlay .wrapper img')[0].dataset.orientation = orientation


    onImageDisplayed: (args) =>
        @isViewing = true
        # Initialize download link
        url = $('.pbThumbs .active img').attr 'src'
        id = @getIdPhoto()

        if @options.editable
            app.router.navigate "albums/#{@album.id}/edit/photo/#{id}", false
        else
            app.router.navigate "albums/#{@album.id}/photo/#{id}", false

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


    onAfterClosed: =>
        @isViewing = false
        if @options.editable
            app.router.navigate "albums/#{@album.id}/edit", true
        else
            app.router.navigate "albums/#{@album.id}", true


    # For each file, add a photo object to the galery, creates its thumbnails
    # and save them to the server.
    # When the process is finished, the first picture is set as the album cover
    # if no cover is et.
    handleFiles: (files) ->
        # Set the view as dirty to warn users it will cancel the upload
        # if he leaves the page during the upload.
        app.router.mainView.dirty = true

        # Prepare common attributes for all pictures.
        @options.beforeUpload (photoAttributes) =>
            @uploadCounter = 0

            # Add a photo to the collection, to avoid browser freezing,
            # after 20 pictures, it waits for 10ms (and release execution loop)
            # before adding pictures to the collection and the view.
            addPhotoAndBreath = (file, callback) =>
                photo = @addPhoto file, photoAttributes

                # When the first photo is uploaded, it is set as the album
                # cover.
                if @uploadCounter is 0
                    photo.on 'uploadComplete', =>
                        @setCoverPicture photo

                if @uploadCounter > 20
                    setTimeout callback, 10
                else
                    @uploadCounter++
                    callback()

            # Process all file creations
            async.eachSeries files, addPhotoAndBreath, =>

                # save reference to the collection on each view.
                view.collection = @collection for key, view of @views
                app.router.mainView.dirty = false


    # Add photo to current collection and enqueue its remote creation.
    addPhoto: (file, photoAttributes) =>
        photoAttributes.title = file.name
        photo = new Photo photoAttributes
        photo.file = file

        @collection.add photo
        photoprocessor.process photo

        photo


    # Set the first picture of the galery as the cover picture of the album.
    setCoverPicture: (photo) =>
        unless @album.get('coverPicture')?
            @album.save coverPicture: photo.get 'id'


    # Display photo picker that allows to select pictures from the Files
    # application.
    displayBrowser: ->
        new FilesBrowser
            model: @album
            collection: @collection
            beforeUpload: @options.beforeUpload


    # Display photo given in URL by triggering a photobox click event on the
    # given photo.
    showPhoto: (photoid) ->
        url = "photos/#{photoid}.jpg"
        $('a[href="' + url + '"]').trigger('click.photobox')


    # Close galery via photobox close button.
    closePhotobox: ->
        if @isViewing
            $('#pbCloseBtn').click()

