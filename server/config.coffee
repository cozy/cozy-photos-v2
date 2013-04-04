module.exports = (app) ->

    express = require 'express'
    shortcuts = require './helpers/shortcut'

    # all environements
    app.use express.bodyParser uploadDir: './uploads'
    app.use shortcuts # extend express to DRY controllers

    #test environement
    app.configure 'test', ->

    #development environement
    app.configure 'development', ->
        app.use express.logger 'dev'
        app.use express.errorHandler
            dumpExceptions: true
            showStack: true

    #production environement
    app.configure 'production', ->
        app.use express.logger()
        app.use express.errorHandler
            dumpExceptions: true
            showStack: true
