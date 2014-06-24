americano = require 'americano'
fs = require 'fs'

module.exports = start = (options, cb) ->
    options.name = 'cozy-photos'
    options.port ?= 9119
    options.host ?= '127.0.0.1'
    americano.start options, (app, server) ->
        app.server = server

        # notification events should be proxied to client
        # RealtimeAdapter = require 'cozy-realtime-adapter'
        # realtime = RealtimeAdapter app, ['album.*', 'photo.*', 'contact.*']

        # pass reference to photo controller for socket.io upload progress
        require('./server/controllers/photo').setApp app

        # create the uploads folder
        try fs.mkdirSync __dirname + '/server/uploads'
        catch err then if err.code isnt 'EEXIST'
            console.log "Something went wrong while creating uploads folder"
            console.log err

        cb?(null, app, server)

if not module.parent
    start
        port: process.env.PORT
        host: process.env.HOST
