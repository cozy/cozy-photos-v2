ViewCollection = require 'lib/view_collection'

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

        @downloadLink = $('#pbOverlay .pbCaptionText .download-link')
        unless @downloadLink.length
            @downloadLink = $('<a class="download-link" download>Download</a>')
                .appendTo '#pbOverlay .pbCaptionText'

        @uploader = @$('#uploader')

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

    onFilesChanged: (evt) =>
        @handleFiles @uploader[0].files
        # reset the input
        old = @uploader
        @uploader = old.clone true
        old.replaceWith @uploader

    onImageDisplayed: () =>
        url = $('.imageWrap img.zoomable').attr 'src'
        url = url.replace '/photos/photos', '/photos/photos/raws'
        @downloadLink.attr 'href', url
        id = url.substring 29, 61
        orientation = @collection._byId[id].attributes.orientation
        helpers.rotate orientation, $('.imageWrap img.zoomable')


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
