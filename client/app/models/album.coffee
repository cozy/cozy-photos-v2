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
        @photos.reset attrs.photos
        delete attrs.photos
        return attrs
