express = require 'express'
init = require './init'
router = require './server/router'
configure = require './server/config'

module.exports = app = express()

app.init = ->
    configure(app)
    clientdir = __dirname + '/client/public'
    staticOptions = maxAge: 86400000
    app.use '/public', express.static clientdir, staticOptions
    app.use express.static clientdir, staticOptions
    router(app)
    return app

if not module.parent
    init -> # ./init.coffee
        app.init()
        port = process.env.PORT or 9113
        host = process.env.HOST or "127.0.0.1"

        app.listen port, host, ->
            console.log "Server listening on %s:%d within %s environment",
                host, port, app.get('env')