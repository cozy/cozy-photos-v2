PhotoCollection = require 'collections/photo'

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
