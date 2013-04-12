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

    # display the "home" page : list of albums
    albumslist: (editable=false)->
        app.albums.fetch().done =>
            @displayView new AlbumsListView
                collection: app.albums
                editable: editable

    # display the list of albums in edit mode
    albumslistedit: ->
        @albumslist true

    # display the album view for an album with given id
    # fetch before displaying it
    album: (id, editable=false) ->
        album = app.albums.get(id) or new Album id:id
        album.fetch().done =>
            @displayView new AlbumView
                model: album
                editable: editable

    # display the album view in edit mode
    albumedit: (id) ->
        @album id, true

    # display the album view for a new Album
    newalbum: ->
        @displayView new AlbumView
            model: new Album()
            editable: true

    # display a page properly (remove previous page)
    displayView: (view) =>
        @mainView.remove() if @mainView
        @mainView = view
        el = @mainView.render().$el
        el.addClass "mode-#{app.mode}"
        $('body').append el