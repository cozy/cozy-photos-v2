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
        app.albums.fetch().then =>
            @displayView new AlbumsListView
                collection: app.albums
                editable: editable

    # display the album view for a new Album
    newalbum: ->
        album = new Album()
        # when the album have been saved, we change the hash
        album.once 'change:id', (model, id) =>
            @navigate "albums/#{id}"

        @displayView new AlbumView
            model: album
            editable: true

    # display the album view for an album from the app.albums collection
    # fetch before displaying it
    album: (id, editable=false) ->
        album = app.albums.get id
        album ?= new Album id:id
        album.fetch().done =>
            @displayView new AlbumView
                model: album
                editable: editable

    # display the list of albums in edit mode
    albumslistedit: ->
        @albumslist true

    # display the album view in edit mode
    albumedit: (id) ->
        @album id, true

    # display a view properly (remove previous view)
    displayView: (view) =>
        @mainView.remove() if @mainView
        @mainView = view
        $('body').append view.render().el