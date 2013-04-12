module.exports =

    initialize: ->
        AlbumCollection = require('collections/album')
        Router = require('router')

        @albums = new AlbumCollection()
        @router = new Router()

        @mode = if window.location.pathname.match /public/ then 'public'
        else 'owner'

        Backbone.history.start()

        Object.freeze this if typeof Object.freeze is 'function'
