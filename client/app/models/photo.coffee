# A photo
# maintains attributes src / thumbsrc depending of the state of the model
module.exports = class Photo extends Backbone.Model

    defaults: ->
        if @id
            thumbsrc: "photos/thumbs/#{@id}.jpg"
            src:      "photos/#{@id}.jpg"
        else
            thumbsrc: 'img/loading.gif'
            src:      ''

    parse: (attrs) ->
        if attrs.id
            attrs.thumbsrc = "photos/thumbs/#{attrs.id}.jpg"
            attrs.src = "photos/#{attrs.id}.jpg"
        return attrs
