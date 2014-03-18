americano = require 'americano'
shortcuts = require './helpers/shortcut'

staticMiddleware = americano.static __dirname + '/../client/public',
            maxAge: 86400000

publicStatic = (req, res, next) ->
    url = req.url
    req.url = req.url.replace '/public', ''
    staticMiddleware req, res, (err) ->
        req.url = url
        next err

markPublicRequests = (req, res, next) ->
    if req.url.match /^\/public/
        req.public = true
    next()


module.exports =
    common:
        set:
            'view engine': 'jade'
            'views': __dirname + '/../client'
        use: [
            americano.bodyParser
                uploadDir: __dirname + '/uploads'
                defer: true # don't wait for full form. Needed for progress events
                keepExtensions: true
                maxFieldsSize: 10 * 1024 * 1024
            staticMiddleware
            publicStatic
            shortcuts
            markPublicRequests

            americano.errorHandler
                dumpExceptions: true
                showStack: true
        ]
    development: [
        americano.logger 'dev'
    ]
    production: [
        americano.logger 'short'
    ]
    plugins: [
        'americano-cozy'
    ]