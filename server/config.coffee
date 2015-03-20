americano = require 'americano'
sharing = require './controllers/sharing'
path = require 'path'
fs = require 'fs'
localizationManager = require('./helpers/localization_manager')
RealtimeAdapter = require('cozy-realtime-adapter')
init = require './helpers/initializer'
thumb = require('./helpers/thumb').create
File = require './models/file'
path = require 'path'
os = require 'os'

staticMiddleware = americano.static __dirname + '/../client/public',
                        maxAge: 86400000

publicStatic = (req, res, next) ->
    url = req.url
    req.url = req.url.replace '/public', ''
    staticMiddleware req, res, (err) ->
        req.url = url
        next err

useBuildView = fs.existsSync path.resolve(__dirname, 'views/index.js')

module.exports =
    common:
        set:
            'view engine': if useBuildView then 'js' else 'jade'
            'views': path.resolve __dirname, 'views'

        engine:
            js: (path, locales, callback) ->
                callback null, require(path)(locales)

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
        afterStart: (app, server) ->

            app.server = server

            # pass reference to photo controller for socket.io upload progress
            require('./controllers/photo').setApp app

            # pass render engine to LocalizationManager
            viewEngine = app.render.bind app
            localizationManager.setRenderer viewEngine

            # create the uploads folder
            try fs.mkdirSync path.join os.tmpdir(), 'uploads'
            catch err then if err.code isnt 'EEXIST'
                console.log "Something went wrong while creating uploads folder"
                console.log err

            # Initialize realtime
            # contact, album & photo events are sent to client
            patterns = ['contact.*', 'album.*', 'photo.*']
            realtime = RealtimeAdapter server, patterns


    development: [
        americano.logger 'dev'
    ]
    production: [
        americano.logger 'short'
    ]
    plugins: [
        'cozydb'
    ]
