ViewCollection = require 'lib/view_collection'

PhotoView = require 'views/photo'
Photo = require 'models/photo'
photoprocessor = require 'models/photoprocessor'

# gallery : collection of PhotoViews
module.exports = class Gallery extends ViewCollection
    itemview: PhotoView

    template: require 'templates/gallery'

    # launch photobox after render
    afterRender: ->
        super
        @$el.photobox 'a.server', thumbs: true, history: false

    # D&D events
    events: ->
        if @options.editable
            'drop'     : 'onFilesDropped'
            'dragover' : 'onDragOver'

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
