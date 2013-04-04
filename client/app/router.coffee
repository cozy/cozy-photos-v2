app   = require 'application'
AlbumListView = require 'views/albumslist'
AlbumView     = require 'views/album'
Album         = require 'models/album'

module.exports = class Router extends Backbone.Router
    routes:
        ''                    : 'albumslist'
        'albums'              : 'albumslist'
        'albums/edit'         : 'albumslistedit'
        'albums/new'          : 'newalbum'
        'albums/:albumid'     : 'album'
        'albums/:albumid/edit': 'albumedit'

    albumslist: ->
        @displayView new AlbumListView
            collection: app.albums
            editable: false

    albumslistedit: ->
        @displayView new AlbumListView
            collection: app.albums
            editable: true

    newalbum: ->
        album = new Album()
        album.once 'change:id', (model, id) =>
            @navigate "albums/#{id}"

        @displayView new AlbumView
            model: album
            editable: true

    album: (id) ->
        album = app.albums.get id
        album.fetch().done =>
            @displayView new AlbumView
                model: album
                editable: false

    albumedit: (id) ->
        album = app.albums.get id
        album.fetch().done =>
            @displayView new AlbumView
                model: album
                editable: true

    displayView: (view) =>
        @mainView.remove() if @mainView
        @mainView = view
        $('body').append view.render().el