app = require 'application'

BaseView = require 'lib/base_view'
Galery = require 'views/galery'
Clipboard = require 'lib/clipboard'

thProcessor = require 'models/thumbprocessor'
CozyClearanceModal = require 'cozy-clearance/modal_share_view'
clipboard = new Clipboard()

TAB_KEY_CODE = 9

class ShareModal extends CozyClearanceModal
    initialize: ->
        super
        @refresh()

    # override makeURL to append the key in the middle of the url
    # see: models/album:getPublicURL
    makeURL: (key) -> @model.getPublicURL key


module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    id: 'album'
    className: 'container-fluid'

    events: =>
        'click a.delete': @destroyModel
        'click a.clearance': @changeClearance
        'click a.sendmail': @sendMail
        'click a#rebuild-th-btn': @rebuildThumbs
        'click a.stopediting': @checkNew
        'blur #title': @onTitleChanged
        'blur #description': @onDescriptionChanged
        'click #title': @onFieldClicked
        'click #description': @onFieldClicked
        'mousedown #title': @onFieldClicked
        'mousedown #description': @onFieldClicked
        'mouseup #title': @onFieldClicked
        'mouseup #description': @onFieldClicked
        'keydown #description': @onDescriptionKeyUp


    initialize: (options) ->
        super options

        @listenTo @model.photos, 'add remove', @onPhotoCollectionChange
        @listenTo @model, 'change:clearance', @render
        @listenTo @model, 'sync', @render

    getRenderData: ->
        key = $.url().param('key')
        downloadPath = "albums/#{@model.get 'id'}.zip"
        downloadPath += "?key=#{key}" if key?

        res = _.extend
            downloadPath: downloadPath
            photosNumber: @model.photos.length
        , @model.attributes
        res

    afterRender: ->
        @galery = new Galery
            el: @$ '#photos'
            editable: @options.editable
            collection: @model.photos
            beforeUpload: @beforePhotoUpload

        @title = @$ '#title'
        @description = @$ '#description'

        @galery.album = @model
        @galery.render()

        document.title = "#{t 'application title'} - #{@model.get 'title'}"

        if @options.editable
            @makeEditable()
        else
            @title.addClass 'disabled'
            @description.addClass 'disabled'

    beforePhotoUpload: (callback) =>
        callback albumid: @model.id

    onTitleChanged: =>
        @saveModel title: @title.val().trim()

    onDescriptionChanged: =>
        @saveModel description: @description.val().trim()

    makeEditable: =>
        @$el.addClass 'editing'
        @options.editable = true
        @galery.options.editable = true

    makeNonEditable: =>
        @$el.removeClass 'editing'
        @options.editable = false
        @galery.options.editable = false

    onFieldClicked: (event) =>
        unless @options.editable
            event.preventDefault()
            false

    # Ask for confirmation if album is not new.
    destroyModel: ->
        if confirm t "are you sure you want to delete this album"
            @model.destroy().then ->
                app.router.navigate 'albums', true

    checkNew: (event) =>
        if @model.get('title') is '' and
           @model.get('description') is '' and
           @model.photos.length is 0
            if confirm t 'delete empty album'
                event.preventDefault()
                @model.destroy().then ->
                    app.router.navigate 'albums', true

    # Change sharing state of the album.
    changeClearance: (event) =>
        @model.set 'clearance', [] unless @model.get('clearance')?
        @model.set 'type', 'album'
        new ShareModal
            model: @model

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

    onDescriptionKeyUp: (event) ->
        if TAB_KEY_CODE in [event.keyCode, event.which]
            $('.stopediting').focus()

    saveModel: (data) ->
        data.updated = Date.now()
        @model.save data

    onPhotoCollectionChange: ->
        @model.save updated: Date.now()
        # updates the photo counter
        @$('.photo-number').html @model.photos.length
