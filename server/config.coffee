module.exports = (app) ->

    express = require 'express'
    shortcuts = require './helpers/shortcut'

    # app.use express.limit '6M'

    # all environements
    app.use express.bodyParser
        uploadDir: './uploads'
        keepExtensions: true
        maxFieldsSize: 6 * 1024 * 1024;

    app.use shortcuts # extend express to DRY controllers

    app.use (req, res, next) ->
        if req.url.match /^\/public/
            req.public = true
        next()

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
