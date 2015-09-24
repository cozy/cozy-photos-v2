path = require 'path'

console.log path.resolve __dirname, '../build/client/public'

exports.config =

    plugins:
        coffeelint:
            options:
                indentation: value:4, level:'error'
        jade:
            globals: ['t']

    conventions:
        vendor: /(vendor)|(_specs)(\/|\\)/ # do not wrap tests in modules
    files:
        javascripts:
            defaultExtension: 'coffee'
            joinTo:
                'javascripts/app.js': /^app/
                'javascripts/vendor.js': /^vendor/
                '../_specs/specs.js': /^_specs.*\.coffee$/
            order:
                before: [
                    # Backbone
                    'vendor/scripts/jquery-1.9.1.js',
                    'vendor/scripts/underscore.js',
                    'vendor/scripts/backbone.js',
                    # Photobox
                    'vendor/scripts/photobox.js',
                    # Async
                    'vendor/scripts/async.js',
                    # Twitter Bootstrap jquery plugins
                    'vendor/scripts/bootstrap.js',
                    'vendor/scripts/polyglot.js',
                    'vendor/scripts/leaflet.js'
                ]
                after: [
                ]
        stylesheets:
            defaultExtension: 'styl'
            joinTo:
                'stylesheets/app.css': /^app/
                'stylesheets/vendor.css': /^vendor/
            order:
                before: [
                    'vendor/styles/bootstrap.min.css'
                ]
                after: []
        templates:
            defaultExtension: 'jade'
            joinTo: 'javascripts/app.js'

    framework: 'backbone'

    overrides:
        production:
            # re-enable when uglifyjs will handle properly in source maps
            # with sourcesContent attribute
            # optimize: false
            sourceMaps: true
            paths:
                public: path.resolve __dirname, '../build/client/public'
