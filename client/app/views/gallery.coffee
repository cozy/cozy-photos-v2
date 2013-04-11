ViewCollection = require 'lib/view_collection'

PhotoView = require 'views/photo'
Photo = require 'models/photo'
photoprocessor = require 'models/photoprocessor'

# gallery : collection of PhotoViews
module.exports = class Gallery extends ViewCollection
    itemview: PhotoView

    # launch photobox after render
    afterRender: ->
        super
        @$el.photobox 'a', thumbs:true

    # pass editable to child views
    itemViewOptions: ->
        editable: @options.editable

    # D&D events
    events: ->
        if @options.editable
            'drop'     : 'onFilesDropped'
            'dragover' : 'onDragOver'

    # event listeners for D&D events
    onFilesDropped: (evt) ->
        @$el.removeClass 'dragover'
        evt.stopPropagation()
        evt.preventDefault()
        files = evt.dataTransfer.files
        @handleFiles(files)
        return false

    onDragOver: (evt) ->
        @$el.addClass 'dragover'
        evt.preventDefault()
        evt.stopPropagation()
        return false

    handleFiles: (files) ->
        # allow parent view to set some attributes on the photo
        # (current usage = albumid + save album if it is new)
        @options.beforeUpload (options) =>
            for file in files
                photoattrs = _.extend title: file.name, options
                photo = new Photo photoattrs
                @collection.add photo

                photoprocessor.process file, photo
