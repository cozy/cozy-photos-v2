americano = require 'americano'
Photo     = require './server/models/photo'

process.on 'uncaughtException', (err) ->
    console.log err
    console.log err.stack

    setTimeout ->
        process.exit 1
    , 1000


module.exports.start = start = (options, cb) ->
    options.name = 'cozy-photos'
    options.root ?= __dirname
    options.port ?= 9119
    options.host ?= '127.0.0.1'
    americano.start options, (err, app, server) ->
        return cb err if err

        Photo.patchGps (err) ->
            if err?
                console.log "Something went wrong during patch -- #{err}"
            else
                console.log  "Patch successfully applied"
        module.exports.app = app
        cb?(null, app, server)

if not module.parent
    start
        port: process.env.PORT
        host: process.env.HOST
