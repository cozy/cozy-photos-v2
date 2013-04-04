ViewCollection = require 'lib/view_collection'
PhotoView = require 'views/photo'
Photo = require 'models/photo'

module.exports = class Gallery extends ViewCollection
    itemview: PhotoView

    events:
        'drop'     : 'onFilesDropped'
        'dragover' : 'onDragOver'

    initialize: (options) ->
        super
        @beforeUpload = options.beforeUpload

    afterRender: ->
        @$el.photobox 'a', thumbs:true , ->

    onFilesDropped: (evt) ->
        @$el.removeClass 'dragover'
        evt.stopPropagation()
        evt.preventDefault()
        files = evt.dataTransfer.files
        @handleFiles(files)
        return false

    onDragOver: (evt) ->
        @$el.addClass 'dragover'
        evt.preventDefault();
        evt.stopPropagation();
        return false

    handleFiles: (files) ->
        @beforeUpload (options) =>
            for file in files
                photoattrs = title: file.name
                photo = new Photo _.extend photoattrs, options

                photo.doUpload file
                @collection.add photo