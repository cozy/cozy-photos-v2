module.exports =

    initialize: ->
        promise = $.ajax('cozy-locale.json')
        promise.done (data) => @locale = data.locale # if success
        promise.fail     () => @locale = 'en'        # else
        promise.always   () => @initializeStep2()    # anyway


    initializeStep2: ->

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

        Backbone.history.start()
