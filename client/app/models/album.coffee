PhotoCollection = require 'collections/photo'

# An album
# Properties :
# - photos : a PhotoCollection of the photo in this album

module.exports = class Album extends Backbone.Model

    urlRoot: 'albums'

    defaults:
        title: ''
        description: ''

    constructor: ->
        @photos = new PhotoCollection()
        return super

    parse: (attrs) ->
        @photos.reset attrs.photos if attrs.photos?.length > 0
        delete attrs.photos
        return attrs
