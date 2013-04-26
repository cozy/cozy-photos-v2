module.exports = (app) ->

    shortcuts = require './helpers/shortcut'
    express   = require 'express'
    http      = require 'http'
    sio       = require 'socket.io'

    # extract http server from express ...
    server = http.createServer app
    app.listen = -> server.listen.apply server, arguments

    # ... so we can plug socket.io
    app.io = sio.listen server
    app.io.set 'log level', 2
    app.io.set 'transports', ['websocket']

    # all environements
    app.use express.bodyParser
        uploadDir: './uploads'
        defer: true # don't wait for full form. Needed for progress events
        keepExtensions: true
        maxFieldsSize: 10 * 1024 * 1024;

    # extend express to DRY controllers
    app.use shortcuts

    # mark public request
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

    # static middleware
    staticMiddleware = express.static __dirname + '/../client/public',
        maxAge: 86400000

    # same client for public and private routes
    app.use '/public', staticMiddleware
    app.use staticMiddleware
