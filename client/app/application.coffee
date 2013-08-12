module.exports =

    initialize: ->

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

        @albums = new AlbumCollection()
        @router = new Router()

        @mode = if window.location.pathname.match /public/ then 'public'
        else 'owner'

        if window.initalbums
            @albums.reset window.initalbums, parse: true
            delete window.initalbums
            Backbone.history.start()
        else
            @albums.fetch().done -> Backbone.history.start()
