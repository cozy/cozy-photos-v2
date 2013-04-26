TESTPORT = 8013
Photo = require '../models/photo'
Album = require '../models/album'
Client = require('request-json').JsonClient
eyes = require 'eyes'

module.exports =

  startServer: (done) ->
      @app = require '../../server.coffee'
      @app.init()

      port = process.env.PORT or TESTPORT
      host = process.env.HOST or "127.0.0.1"
      @server = @app.listen port, host, done

  killServer: ->
      @server.close()

  clearDb: (done) ->
      Photo.requestDestroy "all", (err) ->
          done err if err
          Album.requestDestroy "all", done

  createAlbum: (data) -> (done) ->
      baseAlbum = new Album(data)
      Album.create baseAlbum, (err, album) =>
          @album = album
          done err

  createPhoto: (data) -> (done) ->
      photo = new Photo(title:data.title, albumid:@album.id)
      Photo.create photo, (err, photo) ->
          return done err if err
          thumb = {name:'thumb', type: 'image/jpeg'}
          raw = {name:'raw', type: 'image/jpeg'}
          screen = {name:'raw', type: 'image/jpeg'}
          photo.attachFile data.thumbpath, thumb, (err) ->
              return done err if err
              photo.attachFile data.rawpath, raw, (err) ->
                  return done err if err
                  photo.attachFile data.screenpath, screen, done


  makeTestClient: (done) ->
      old = new Client "http://localhost:#{TESTPORT}/"

      store = this # this will be the common scope of tests

      callbackFactory = (done) -> (error, response, body) =>
          throw error if(error)
          store.response = response
          store.body = body
          done()

      clean = ->
          store.response = null
          store.body = null

      store.client =
          get: (url, done) ->
              clean()
              old.get url, callbackFactory(done)
          post: (url, data, done) ->
              clean()
              old.post url, data, callbackFactory(done)
          put: (url, data, done) ->
              clean()
              old.put url, data, callbackFactory(done)
          del: (url, done) ->
              clean()
              old.del url, callbackFactory(done)
          sendFile: (url, path, done) ->
              old.sendFile url, path, callbackFactory(done)
          saveFile: (url, path, done) ->
              old.saveFile url, path, callbackFactory(done)

      # for fn in ['get', 'post', 'put', 'del', 'sendFile', 'saveFile']
      #     testClient[fn] = ->
      #       clean()

      #       args = Array.prototype.slice.call arguments, 0
      #       args.push callbackFactory args.pop()

      #       Client.prototype[fn].apply old, args

      # store.client = testClient

      done()