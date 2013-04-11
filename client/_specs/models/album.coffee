describe 'Models/Album', ->

    Album = require 'models/album'
    PhotoCollection = require 'collections/photo'

    before -> @model = new Album()
    before createSinonServer
    after -> @server.restore()

    it 'should have a photos field, of type PhotoCollection', ->
        expect(@model.photos).to.be.instanceof PhotoCollection

    it 'should post /albums on save', ->
        callback = sinon.spy()
        @model.save(title:'test-title').then callback
        @server.checkLastRequestIs 'POST', 'albums'
        @server.respond()
        expect(callback.calledOnce).to.be.ok

    it 'should then have id from the server', ->
        expect(@model.id).to.equal 'a1'

    it 'should put /albums/a1 on save', ->
        callback = sinon.spy()
        @model.save(description:'test-desc').then callback
        @server.checkLastRequestIs 'PUT', 'albums/a1'
        @server.respond()
        expect(callback.calledOnce).to.be.ok

    it 'should get /albums/a1 on fetch', ->
        callback = sinon.spy()
        @model.fetch().then callback
        @server.checkLastRequestIs 'GET', 'albums/a1'
        @server.respond()
        expect(callback.calledOnce).to.be.ok

    it 'should del /albums/a1 on destroy', ->
        callback = sinon.spy()
        @model.destroy().then callback
        @server.checkLastRequestIs 'DELETE', 'albums/a1'
        @server.respond()
        expect(callback.calledOnce).to.be.ok
