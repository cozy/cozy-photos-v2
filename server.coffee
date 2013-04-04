express = require 'express'
router = require './server/router'
configure = require './server/config'
app = express()

configure(app)

app.use express.static __dirname + '/client/public', maxAge: 86400000

router(app)


if not module.parent

    port = process.env.PORT or 9113
    host = process.env.HOST or "127.0.0.1"

    app.listen port, host, ->
        console.log "Server listening on %s:%d within %s environment",
            host, port, app.get('env')