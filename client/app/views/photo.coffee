BaseView = require 'lib/base_view'

module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    events: =>
        'click   btn.delete' : => @model.destroy()

    getRenderData: ->
        data = {}
        data.thumbsrc = if @model.isNew() then @model.thumb_du
        else "photos/thumbs/#{@model.id}.jpg"
        data.thumbsrc ?= 'http://placehold.it/150/&text=loading'

        data.src = if @model.isNew() then @model.file_du
        else "photos/#{@model.id}.jpg"
        data.src ?= "#"

        _.extend data, @model.attributes

    initialize: (options) ->
        super
        @listenTo @model, 'change', ->
            console.log arguments
            @render()
