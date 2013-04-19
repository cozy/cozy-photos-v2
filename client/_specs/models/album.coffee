describe 'models/album', ->

    Album = require 'models/album'
    PhotoCollection = require 'collections/photo'

    before -> @model = new Album()
    before createSinonServer
    after -> @server.restore()

    it 'should have a photos field, of type PhotoCollection', ->
        expect(@model.photos).to.be.instanceof PhotoCollection
