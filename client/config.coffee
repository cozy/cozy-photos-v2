exports.config =

  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  paths:
    public: 'public'
  files:
    javascripts:
      defaultExtension: 'coffee'
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
        'test/javascripts/test.js': /^test(\/|\\)(?!vendor)/
        'test/javascripts/test-vendor.js': /^test(\/|\\)(?=vendor)/
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
        ]
        after: [
        ]
    stylesheets:
      defaultExtension: 'styl'
      joinTo:
        'stylesheets/app.css': /^app/
        'stylesheets/vendor.css': /^vendor/
      order:
        before: []
        after: []
    templates:
      defaultExtension: 'jade'
      joinTo: 'javascripts/app.js'
  framework: 'backbone'
