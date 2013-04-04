BaseView = require 'lib/base_view'

module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    events:
        'click   btn.delete' : 'deletePhoto'

    getRenderData: -> @model.attributes

    initialize: ->
        @listenTo @model, 'change', @render

    deletePhoto: ->
        @model.destroy()
