ViewCollection = require 'lib/view_collection'

PhotoView = require 'views/photo'
Photo = require 'models/photo'
photoprocessor = require 'models/photoprocessor'

module.exports = class Gallery extends ViewCollection
    itemview: PhotoView

    events:
        'drop'     : 'onFilesDropped'
        'dragover' : 'onDragOver'

    initialize: (options) ->
        super
        @beforeUpload = options.beforeUpload

    afterRender: ->
        super
        @$el.photobox 'a', thumbs:true

    itemViewOptions: -> editable: @options.editable

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
        console.log 'B'
        @beforeUpload (options) =>
            console.log 'A'
            for file in files
                console.log 'C'
                photoattrs = _.extend title: file.name, options
                photo = new Photo photoattrs
                @collection.add photo
                console.log 'D'

                photoprocessor.process file, photo
