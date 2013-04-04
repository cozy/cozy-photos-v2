module.exports = Application =

    initialize: ->
        AlbumCollection = require('collections/album')
        Router = require('router')

        @albums = new AlbumCollection()
        @router = new Router()

        @albums.fetch()
        @albums.once 'sync', ->
            Backbone.history.start()

        Object.freeze this if typeof Object.freeze is 'function'
