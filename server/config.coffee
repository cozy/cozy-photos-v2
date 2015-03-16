americano = require 'americano'
shortcuts = require './helpers/shortcut'
sharing = require './controllers/sharing'

staticMiddleware = americano.static __dirname + '/../client/public',
                        maxAge: 86400000

publicStatic = (req, res, next) ->
    url = req.url
    req.url = req.url.replace '/public', ''
    staticMiddleware req, res, (err) ->
        req.url = url
        next err

module.exports =
    common:
        set:
            'view engine': 'jade'
            'views': __dirname + '/../client'
        use: [
            americano.methodOverride()
            americano.bodyParser()

            staticMiddleware
            publicStatic

            sharing.markPublicRequests
        ]
        useAfter: [
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
        'cozydb'
    ]
