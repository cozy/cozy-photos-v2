app = require 'application'
BaseView = require 'lib/base_view'
Gallery = require 'views/gallery'
{editable} = require 'lib/helpers'

module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    className: 'container-fluid'

    events: =>
        'click   a.delete' : =>
            @model.destroy().then ->
                app.router.navigate 'albums', true

    getRenderData: -> @model.attributes

    afterRender: ->
        @about       = @$ '#about'
        @title       = @$ '#title'
        @gallerydiv  = @$ '#photos'
        @description = @$ '#description'

        @gallery = new Gallery
            el: @gallerydiv
            editable: @options.editable
            collection: @model.photos
            beforeUpload: @beforePhotoUpload

        @gallery.render()

        @makeEditable() if @options.editable

    # save album before photos are uploaded to it
    # store albumid in the photo
    beforePhotoUpload: (done) =>
        if @model.isNew()
            @saveModel().then => done albumid:@model.id
        else
            done albumid:@model.id

    # make the divs editable
    makeEditable: =>
        editable @title,
            placeholder: 'Title ...'
            onChanged: (text) => @saveModel title: text

        editable @description,
            placeholder: 'Write some more ...'
            onChanged: (text) => @saveModel description: text

    saveModel: (hash) ->
        @model.save(hash).then -> app.albums.add @model


