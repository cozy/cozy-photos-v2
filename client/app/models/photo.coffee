# A photo
# maintains attributes src / thumbsrc depending of the state of the model
module.exports = class Photo extends Backbone.Model

    defaults: ->
        thumbsrc: 'img/loading.gif'
        src: ''
        orientation: 1

    parse: (attrs) ->
        if not attrs.id then attrs
        else _.extend attrs,
            thumbsrc: "photos/thumbs/#{attrs.id}.jpg"
            src: "photos/#{attrs.id}.jpg"
            orientation: attrs.orientation

    getPrevSrc: ->
        "photos/#{@get 'id'}.jpg"
