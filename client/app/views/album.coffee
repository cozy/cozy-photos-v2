app = require 'application'
BaseView = require 'lib/base_view'
Gallery = require 'views/gallery'
{editable} = require 'lib/helpers'

module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    id: 'album'
    className: 'container-fluid'

    events: =>
        'click   a.delete' : @destroyModel
        'click   a.changeclearance' : @changeClearance

    getRenderData: ->
        clearanceHelpers = @clearanceHelpers(@model.get 'clearance')
        _.extend {clearanceHelpers: clearanceHelpers}, @model.attributes

    afterRender: ->
        @gallery = new Gallery
            el: @$ '#photos'
            editable: @options.editable
            collection: @model.photos
            beforeUpload: @beforePhotoUpload

        @gallery.render()

        @makeEditable() if @options.editable

    # save album before photos are uploaded to it
    # store albumid in the photo
    beforePhotoUpload: (callback) =>
        @saveModel().then =>
            callback albumid: @model.id

    # make the divs editable
    makeEditable: =>
        @$el.addClass 'editing'

        @refreshPopOver @model.get 'clearance'

        editable @$('#title'),
            placeholder: t 'Title ...'
            onChanged: (text) => @saveModel title: text

        editable @$('#description'),
            placeholder: t 'Write some more ...'
            onChanged: (text) => @saveModel description: text

    destroyModel: ->
        if @model.isNew()
            return app.router.navigate 'albums', true

        if confirm t 'Are you sure ?'
            @model.destroy().then ->
                app.router.navigate 'albums', true

    changeClearance: (event) ->
        newclearance = event.target.id.replace 'change', ''

        @saveModel(clearance: newclearance).then =>
            @refreshPopOver newclearance

    refreshPopOver: (clearance) ->
        help =  @clearanceHelpers clearance
        modal = @$('#clearance-modal')

        @$('.clearance').find('span').text clearance
        modal.find('h3').text help.title
        modal.find('.modal-body').html help.content
        modal.find('.changeclearance').show()
        modal.find('#change' + clearance).hide()

    saveModel: (hash) ->
        promise = @model.save(hash)
        if @model.isNew()
            promise = promise.then =>
                app.albums.add @model
                app.router.navigate "albums/#{@model.id}/edit"

        return promise

    getPublicUrl: ->
        origin = window.location.origin
        path = window.location.pathname.replace 'apps', 'public'
        path = '/public/' if path is '/'
        hash = window.location.hash.replace '/edit', ''
        return origin + path + hash

    clearanceHelpers: (clearance) ->
        if clearance is 'public'
            title: t 'This album is public'
            content: t 'It will appears on your homepage.'
        else if clearance is 'hidden'
            title: t 'This album is hidden'
            content: t("hidden-description") + " #{@getPublicUrl()}"
        else if clearance is 'private'
            title: t 'This album is private'
            content: t 'It cannot be accessed from the public side'
