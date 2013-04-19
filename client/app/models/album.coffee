PhotoCollection = require 'collections/photo'

# An album
# Properties :
# - photos : a PhotoCollection of the photo in this album
# maintains attribute

module.exports = class Album extends Backbone.Model

    urlRoot: 'albums'

    defaults: ->
        title: ''
        description: ''
        clearance: 'private'
        thumbsrc: 'img/nophotos.gif'

    constructor: ->
        @photos = new PhotoCollection()
        return super

    parse: (attrs) ->
        if attrs.photos?.length > 0
            @photos.reset attrs.photos, parse: true
        delete attrs.photos
        if attrs.thumb
            attrs.thumbsrc = "photos/thumbs/#{attrs.thumb}.jpg"
        return attrs
