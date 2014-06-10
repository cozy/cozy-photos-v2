module.exports =

    initialize: ->

        # Translation helpers.
        @locale = window.locale
        @polyglot = new Polyglot()
        try
            locales = require 'locales/'+ @locale
        catch e
            locales = require 'locales/en'

        @polyglot.extend locales
        window.t = @polyglot.t.bind @polyglot

        AlbumCollection = require('collections/album')
        Router = require('router')

        @router = new Router()

        # Base data
        @albums = new AlbumCollection()

        @mode = if window.location.pathname.match /public/ then 'public'
        else 'owner'

        # Display albums. Fetch data if no data were loaded via server index.
        if window.initalbums
            @albums.reset window.initalbums, parse: true
            delete window.initalbums
            Backbone.history.start()
        else
            @albums.fetch().done -> Backbone.history.start()
