SocketListener = require './lib/socket_listener'

module.exports =

    initialize: ->

        window.app = this
        # Translation helpers.
        @locale = window.locale
        @polyglot = new Polyglot locale: @locale
        try
            locales = require 'locales/'+ @locale
        catch e
            locales = require 'locales/en'

        @polyglot.extend locales
        window.t = @polyglot.t.bind @polyglot

        AlbumCollection = require('collections/album')
        Router = require('router')

        @router = new Router()

        $(window).on "hashchange", @router.hashChange
        $(window).on "beforeunload", @router.beforeUnload

        # Base data
        @albums = new AlbumCollection()

        @urlKey = ""
        if window.location.search
            for param in window.location.search.substring(1).split '&'
                [key, value] = param.split '='
                @urlKey = "?key=#{value}" if key is 'key'

        @mode = if window.location.pathname.match /public/ then 'public'
        else 'owner'

        if @mode isnt 'public'
            # on public pages, realtime is not available, so we don't need
            # the socket listener, to prevent 404
            @socketListener = new SocketListener()

        # Display albums. Fetch data if no data were loaded via server index.
        if window.initalbums
            @albums.reset window.initalbums, parse: true
            delete window.initalbums
            Backbone.history.start()
        else
            @albums.fetch().done -> Backbone.history.start()
