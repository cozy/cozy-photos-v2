BaseView = require 'lib/base_view'

# View for a single photo
module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    initialize: (options) ->
        super
        # render every time the model change
        @listenTo @model, 'change', -> @render()

    events: =>
        'click   btn.delete' : => @model.destroy()

    getRenderData: ->
        thumb = 'img/loading.gif'
        if not @model.isNew()
            thumb = "photos/thumbs/#{@model.id}.jpg"
        else if @model.thumb_du
            thumb = @model.thumb_du

        src = if not @model.isNew() then "photos/#{@model.id}.jpg"
        else 'img/loading.gif'

        return _.extend {thumbsrc:thumb, src:src}, @model.attributes
