app            = require 'application'
AlbumsListView = require 'views/albumslist'
AlbumView      = require 'views/album'
Album          = require 'models/album'

module.exports = class Router extends Backbone.Router
    routes:
        ''                    : 'albumslist'
        'albums'              : 'albumslist'
        'albums/edit'         : 'albumslistedit'
        'albums/new'          : 'newalbum'
        'albums/:albumid'     : 'album'
        'albums/:albumid/edit': 'albumedit'
        'albums/:albumid/photo/:photoid': 'photo'
        'albums/:albumid/edit/photo/:photoid': 'photoedit'
#MODIF:remi
        'map':'showmap'
    # display the 'map' page
    showmap: ->


    # display the "home" page : list of albums
    albumslist: (editable=false)->
        @displayView new AlbumsListView
            collection: app.albums.sort()
            editable: editable

    # display the list of albums in edit mode
    albumslistedit: ->
        return @navigate 'albums', true if app.mode is 'public'
        @albumslist true

    # display the album view for an album with given id
    # fetch before displaying it
    album: (id, editable=false, callback) ->
        if @mainView?.model?.get('id') is id

            if editable
                @mainView.makeEditable()
            else
                @mainView.makeNonEditable()

            if callback
                callback()
            else
                @mainView.closeGallery()

        else
            album = app.albums.get(id) or new Album id: id
            album.fetch()
                .done =>
                    @displayView new AlbumView
                        model: album
                        editable: editable

                    if callback
                        callback()
                    else
                        @mainView.closeGallery()

                .fail =>
                    alert t 'this album does not exist'
                    @navigate 'albums', true


    # Display given photo from given album (non edit mode).
    photo: (albumid, photoid) ->
        @album albumid, false, =>
            @mainView.showPhoto photoid


    # Display given photo from given album (edit mode).
    photoedit: (albumid, photoid) ->
        @album albumid, true, =>
            @mainView.showPhoto photoid


    # display the album view in edit mode
    albumedit: (id) ->
        return @navigate 'albums', true if app.mode is 'public'
        @album id, true
        setTimeout ->
            $('#title').focus()
        , 200

    # display the album view for a new Album
    newalbum: ->
        return @navigate 'albums', true if app.mode is 'public'
        window.app.albums.create {},
            success: (model) =>
                @navigate "albums/#{model.id}/edit", true
            error: =>
                @navigate "albums", true

    # display a page properly (remove previous page)
    displayView: (view) =>
        @mainView.remove() if @mainView
        @mainView = view

        el = @mainView.render().$el
        el.addClass "mode-#{app.mode}"
        $('body').append el

    hashChange: (event) =>
        if @cancelNavigate
            event.stopImmediatePropagation()
            @cancelNavigate = false
        else

            # default window title
            document.title = t 'application title'

            if @mainView and @mainView.dirty
                if not(window.confirm t("Navigate before upload"))
                    event.stopImmediatePropagation()
                    @cancelNavigate = true
                    window.location.href = event.originalEvent.oldURL
                else
                    @mainView.dirty = false

    beforeUnload: (event) =>
        if @mainView and @mainView.dirty
            # Chrome will display this message, Firefox won't
            confirm = t("Navigate before upload")
        else
            confirm = undefined
        event.returnValue = confirm
        return confirm
