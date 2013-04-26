fixtures = require './fixtures/data'
fs = require 'fs'
helpers = require './helpers'
expect = require('chai').expect

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
            @albumid = @body.id


    describe 'Create Photo - POST /photos', ->

        raw = "./server/_specs/fixtures/test.jpg"
        screen = "./server/_specs/fixtures/screen.jpg"
        thumb = "./server/_specs/fixtures/thumb.jpg"

        it "should allow request", (done) ->
            req = @client.post "photos", null, done
            form = req.form()
            form.append 'title', 'phototitle'
            form.append 'albumid', @albumid
            form.append 'raw', fs.createReadStream(raw)
            form.append 'screen', fs.createReadStream(screen)
            form.append 'thumb', fs.createReadStream(thumb)

        it 'should reply with the created photo', ->
            expect(@body.title).to.equal 'phototitle'
            @photoid = @body.id


    describe 'Update Album - PUT /albums/:id', ->

        update =
            description: "newdescription"
            title: "newtitle"
            id: @albumid

        it 'should allow requests', (done) ->
            @client.put "albums/#{@albumid}", update, done

        it 'should reply with the updated album', ->
            expect(@body.description).to.equal 'newdescription'
            expect(@body.title).to.equal 'newtitle'
            expect(@body.id).to.exist

        it 'when I GET the album', (done) ->
            @client.get "albums/#{@albumid}", done

        it 'then it is changed', ->
            expect(@body.description).to.equal 'newdescription'


    describe 'Update Photo - PUT /photos/:id', ->

        update =
            title: 'newtitle'

        it 'should allow requests', (done) ->
            @client.put "photos/#{@photoid}", update, done

        it 'should reply with the updated photo', ->
            expect(@body.title).to.equal 'newtitle'

        it 'should have keeped its attachements', ->
            expect(@body._attachments.raw).to.exist
            expect(@body._attachments.thumb).to.exist


    describe 'Delete Photo - DELETE /photos/:id', ->

        it 'should allow requests', (done) ->
            @client.del "photos/#{@photoid}", done

        it 'should reply with nothing', ->
            expect(@body.success).to.be.ok

        it 'should not be GETable', (done) ->
            @client.get "photos/#{@photoid}.jpg", (err) ->
                expect(err).to.be.not.null
                done()


    describe 'Delete Album - DELETE /albums/:id', ->

        it 'should allow requests', (done) ->
            @client.del "albums/#{@albumid}", done

        it 'should reply with a success msg', ->
            expect(@body.success).to.be.ok

        it 'should not be GETable', (done) ->
            @client.get 'albums/#{@albumid}', (err) ->
                expect(err).to.be.not.null
                done()