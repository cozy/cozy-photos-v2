app = require 'application'

BaseView = require 'lib/base_view'
Galery = require 'views/galery'
Clipboard = require 'lib/clipboard'
{editable} = require 'lib/helpers'

thProcessor = require 'models/thumbprocessor'
CozyClearanceModal = require 'cozy-clearance/modal_share_view'
contactModel = require 'models/contact'

Contact = new contactModel()
clipboard = new Clipboard()

class ShareModal extends CozyClearanceModal
    initialize: ->
        super
        @refresh()

module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    id: 'album'
    className: 'container-fluid'

    events: =>
        'click a.delete': @destroyModel
        'click a.clearance': @changeClearance
        'click a.sendmail': @sendMail
        'click a#rebuild-th-btn': @rebuildThumbs

    getRenderData: ->
        res = _.extend
            photosNumber: @model.photos.length
        , @model.attributes
        res

    afterRender: ->
        @galery = new Galery
            el: @$ '#photos'
            editable: @options.editable
            collection: @model.photos
            beforeUpload: @beforePhotoUpload

        # Do not run afterRender again when model changed.
        @model.on 'change', =>
            data = _.extend {}, @options, @getRenderData()
            @$el.html @template(data)
            @$el.find("#photos").append @galery.$el

        @galery.album = @model
        @galery.render()

        @makeEditable() if @options.editable

    # save album before photos are uploaded to it
    # store albumid in the photo
    beforePhotoUpload: (callback) =>
        @saveModel().then =>
            callback albumid: @model.id

    # make the divs editable
    makeEditable: =>
        @$el.addClass 'editing'

        editable @$('#title'),
            placeholder: t 'Title ...'
            onChanged: (text) => @saveModel title: text.trim()

        editable @$('#description'),
            placeholder: t 'Write some more ...'
            onChanged: (text) => @saveModel description: text.trim()

    # Ask for confirmation if album is not new.
    destroyModel: ->
        if @model.isNew()
            return app.router.navigate 'albums', true

        if confirm t 'Are you sure ?'
            @model.destroy().then ->
                app.router.navigate 'albums', true

    # Change sharing state of the album.
    changeClearance: (event) =>
        @model.set 'clearance', [] unless @model.get('clearance')?
        @model.set 'type', 'album'

        console.log @model
        new ShareModal model: @model


    # Temporary tool to allow people to rebuild the thumbnails with size
    # set recently. New size is larger, so older thumbs looks blurry.
    # This function recalculate them with the right size
    rebuildThumbs: (event) ->
        $("#rebuild-th p").remove()
        models = @model.photos.models

        recFunc = ->
            if models.length > -1
                model = models.pop()
                setTimeout ->
                    thProcessor.process model
                    recFunc()
                , 500
        recFunc()


    saveModel: (hash) ->
        promise = @model.save(hash)
        if @model.isNew()
            promise = promise.then =>
                app.albums.add @model
                app.router.navigate "albums/#{@model.id}/edit"
        return promise

    # Get public url of the current album (the url shared with contacts).
    getPublicUrl: ->
        origin = window.location.origin
        path = window.location.pathname.replace 'apps', 'public'
        path = '/public/' if path is '/'
        hash = window.location.hash.replace '/edit', ''
        return origin + path + hash
