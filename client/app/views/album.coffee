app = require 'application'
BaseView = require 'lib/base_view'
Gallery = require 'views/gallery'
{editable} = require 'lib/helpers'

module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    className: 'container-fluid'

    initialize: (options) ->
        super
        @model.fetch() unless @model.isNew()

    getRenderData: ->
        _.extend {editable: @editable}, @model.attributes

    afterRender: ->
        @about       = @$ '#about'
        @title       = @$ '#title'
        @gallerydiv  = @$ '#photos'
        @description = @$ '#description'

        @gallery = new Gallery
            el: @gallerydiv
            editable : @editable
            collection : @model.photos
            beforeUpload : @beforePhotoUpload

        if @options.editable
            editable @title,
                placeholder: 'Title ...'
                onChanged: (text) => @saveModel title: text

            editable @description,
                placeholder: 'Write some more ...'
                onChanged: (text) => @saveModel description: text

    beforePhotoUpload: (done) =>
        if @model.isNew()
            saveModel().then => done albumid:@model.id
        else
            done albumid:@model.id

    saveModel: (hash) ->
        @model.save(hash).then -> app.albums.add @model


