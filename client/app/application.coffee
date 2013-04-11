module.exports =

    initialize: ->
        AlbumCollection = require('collections/album')
        Router = require('router')

        @albums = new AlbumCollection()
        @router = new Router()

        Backbone.history.start()

        Object.freeze this if typeof Object.freeze is 'function'
