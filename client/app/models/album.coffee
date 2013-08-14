PhotoCollection = require 'collections/photo'
client = require "../helpers/client"

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
        orientation: 1

    constructor: ->
        @photos = new PhotoCollection()
        return super

    parse: (attrs) ->
        if attrs.photos?.length > 0
            @photos.reset attrs.photos, parse: true
        delete attrs.photos
        if attrs.thumb
            attrs.thumbsrc = "photos/thumbs/#{attrs.thumb}.jpg"
            if @photos.get(attrs.thumb)?.attributes?.orientation?
                attrs.orientation = 
                    @photos._byId[attrs.thumb].attributes.orientation
        return attrs

    sendMail: (url, mails, callback) ->
        data =
            url: url
            mails: mails
        client.post "albums/share", data, callback
