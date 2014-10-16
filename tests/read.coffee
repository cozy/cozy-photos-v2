fixtures = require './fixtures/data'
fs = require 'fs'
helpers = require './helpers'
expect = require('chai').expect

store = {}

describe 'Read operations', ->

    before helpers.clearDb
    before helpers.createAlbum fixtures.baseAlbum
    before helpers.createPhoto fixtures.basePhoto1
    before helpers.createPhoto fixtures.basePhoto2

    before helpers.startServer
    before helpers.makeTestClient
    after  helpers.killServer
    after -> fs.unlinkSync './test-get.jpg'

    describe 'List - GET /albums', ->

        it 'should allow requests', (done) ->
            @client.get 'albums', done

        it 'should reply with the list of albums', ->
            expect(@body).to.be.an 'array'
            expect(@body).to.have.length 1
            expect(@body[0].id).to.exist
            expect(@body[0].title).to.equal fixtures.baseAlbum.title
            store.id = @body[0].id

        it 'should not include photos', ->
            expect(@body[0].photos).to.not.exist

    describe 'Read - GET /albums/:id', ->

        it 'should allow requests', (done) ->
            @client.get "albums/#{store.id}", done

        it 'should reply with one album', ->
            expect(@body.description).to.equal fixtures.baseAlbum.description
            expect(@body.title).to.equal fixtures.baseAlbum.title
            expect(@body.id).to.exist

        it 'should include photos', ->
            expect(@body.photos).to.be.an 'array'
            expect(@body.photos).to.have.length 2
            store.photoid = @body.photos[0].id

    describe 'Show photos - GET /photos/:id.jpg', ->

        downloadPath = './test-get.jpg'
        after: (done) -> fs.unlink downloadPath, done

        it "should allow requests", (done) ->
            @client.saveFile "photos/#{store.photoid}.jpg", downloadPath, done

        it "should not change the file", ->
            fileStats = fs.statSync(fixtures.basePhoto1.screenpath)
            resultStats = fs.statSync(downloadPath)
            expect(resultStats.size).to.equal fileStats.size

    describe 'Show thumb - GET /photos/tumbs/:id.jpg', ->

        downloadPath = './test-get.jpg'
        after: (done) -> fs.unlink downloadPath, done

        it "should allow requests", (done) ->
            url = "photos/thumbs/#{store.photoid}.jpg"
            @client.saveFile url, downloadPath, done

        it "should not change the file", ->
            fileStats = fs.statSync(fixtures.basePhoto1.thumbpath)
            resultStats = fs.statSync(downloadPath)
            expect(resultStats.size).to.equal fileStats.size
