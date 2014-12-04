americano = require 'americano'
fs = require 'fs'
init = require './init'
thumb = require('./server/helpers/thumb').create
File = require './server/models/file'
RealtimeAdapter = require('cozy-realtime-adapter')
sio = require 'socket.io'
axon = require 'axon'

module.exports = start = (options, cb) ->
    options.name = 'cozy-photos'
    options.port ?= 9119
    options.host ?= '127.0.0.1'
    americano.start options, (app, server) ->
        app.server = server

        # pass reference to photo controller for socket.io upload progress
        require('./server/controllers/photo').setApp app

        # create the uploads folder
        try fs.mkdirSync __dirname + '/server/uploads'
        catch err then if err.code isnt 'EEXIST'
            console.log "Something went wrong while creating uploads folder"
            console.log err

        socket = axon.socket 'sub-emitter'
        socket.connect 9105

        io = sio.listen app.server, {}
        io.set 'log level', 2
        io.set 'transports', ['websocket']

        socket.on 'file.*', (event, msg) ->
            if not (event is "delete")
                File.find msg, (err, file) ->
                    if file.binary?.file? and not file.binary.thumb
                        thumb file, (err) ->
                            console.log err if err?

        init.convert(io.sockets)
        cb?(null, app, server)

if not module.parent
    start
        port: process.env.PORT
        host: process.env.HOST
