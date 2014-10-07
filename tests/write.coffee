fixtures = require './fixtures/data'
fs = require 'fs'
helpers = require './helpers'
expect = require('chai').expect


store = {}

describe 'Write operations', ->

    before helpers.clearDb

    before helpers.startServer
    before helpers.makeTestClient
    after  helpers.killServer

    describe 'Create Album - POST /albums', ->

        album =
            description: "mydescription"
            title: "mytitle"

        it 'should allow requests', (done) ->
            @client.post 'albums', album, done

        it 'should reply with the created album', ->
            expect(@body.description).to.equal album.description
            expect(@body.title).to.equal album.title
            expect(@body.id).to.exist
            store.albumid = @body.id


    describe 'Create Album with multiline title - POST /albums', ->

        album =
            title: "mytitle<div><br></div>"

        it 'should allow requests', (done) ->
            @client.post 'albums', album, done

        it 'should reply with the created album with a sanitized title', ->
            expect(@body.title).to.equal 'mytitle'


    describe 'Create Photo - POST /photos', ->

        raw = "./tests/fixtures/test.jpg"
        screen = "./tests/fixtures/screen.jpg"
        thumb = "./tests/fixtures/thumb.jpg"

        it "should allow request", (done) ->
            @timeout 6000
            req = @client.post "photos", null, done
            form = req.form()
            form.append 'title', 'phototitle'
            form.append 'albumid', store.albumid
            form.append 'raw', fs.createReadStream(raw)
            form.append 'screen', fs.createReadStream(screen)
            form.append 'thumb', fs.createReadStream(thumb)

        it 'should reply with the created photo', ->
            expect(@body.title).to.equal 'phototitle'
            store.photoid = @body.id


    describe 'Update Album - PUT /albums/:id', ->

        update =
            description: "newdescription"
            title: "newtitle"
            id: store.albumid

        it 'should allow requests', (done) ->
            @client.put "albums/#{store.albumid}", update, done

        it 'should reply with the updated album', ->
            expect(@body.description).to.equal 'newdescription'
            expect(@body.title).to.equal 'newtitle'
            expect(@body.id).to.exist

        it 'when I GET the album', (done) ->
            @client.get "albums/#{store.albumid}", done

        it 'then it is changed', ->
            expect(@body.description).to.equal 'newdescription'


    describe 'Update Album with multiline title - POST /albums', ->

        update =
            title: "newtitle<div><br></div>"
            id: store.albumid

        it 'should allow requests', (done) ->
            @client.put "albums/#{store.albumid}", update, done

        it 'should reply with the updated album with a sanitized title', ->
            expect(@body.title).to.equal 'newtitle'

        it 'when I GET the album', (done) ->
            @client.get "albums/#{store.albumid}", done

        it 'then it is changed', ->
            expect(@body.title).to.equal 'newtitle'


    describe 'Update Photo - PUT /photos/:id', ->

        update =
            title: 'newtitle'

        it 'should allow requests', (done) ->
            @client.put "photos/#{store.photoid}", update, done

        it 'should reply with the updated photo', ->
            expect(@body.title).to.equal 'newtitle'

        it 'should have keeped its attachements', ->
            expect(@body.binary.raw).to.exist
            expect(@body.binary.thumb).to.exist


    describe 'Delete Photo - DELETE /photos/:id', ->

        it 'should allow requests', (done) ->
            @client.del "photos/#{store.photoid}", done

        it 'should reply with nothing', ->
            expect(@body.success).to.be.ok

        it 'should not be GETable', (done) ->
            @client.get "photos/#{store.photoid}.jpg", (err) ->
                expect(err).to.be.not.null
                done()


    describe 'Delete Album - DELETE /albums/:id', ->

        it 'should allow requests', (done) ->
            @client.del "albums/#{store.albumid}", done

        it 'should reply with a success msg', ->
            expect(@body.success).to.be.ok

        it 'should not be GETable', (done) ->
            @client.get 'albums/#{store.albumid}', (err) ->
                expect(err).to.be.not.null
                done()
