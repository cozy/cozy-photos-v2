PhotoCollection = require 'collections/photo'
client = require "../lib/client"

# An album
# Properties :
# - photos : a PhotoCollection of the photo in this album
# maintains attribute

module.exports = class Album extends Backbone.Model

    urlRoot: 'albums'

    defaults: ->
        title: ''
        description: ''
        clearance: []
        thumbsrc: 'img/nophotos.gif'
        orientation: 1

    constructor: ->
        @photos = new PhotoCollection()
        return super

    # Build orientation and cover thumb src from photo attribute/
    parse: (attrs) ->

        if attrs.photos?.length > 0
            @photos.reset attrs.photos, parse: true
        delete attrs.photos

        if attrs.coverPicture
            attrs.thumbsrc = "photos/thumbs/#{attrs.coverPicture}.jpg"
            if @photos.get(attrs.thumb)?.attributes?.orientation?
                attrs.orientation =
                    @photos._byId[attrs.thumb].attributes.orientation

        return attrs

    # Build cover thumb src from coverPicture field.
    getThumbSrc: ->
        "photos/thumbs/#{@get 'coverPicture'}.jpg"

    getPublicURL: ->
        "#{window.location.origin}/public/albums/#{@id}"

    # Send sharing email for this album.
    sendMail: (url, mails, callback) ->
        data =
            url: url
            mails: mails
        client.post "albums/share", data, callback
