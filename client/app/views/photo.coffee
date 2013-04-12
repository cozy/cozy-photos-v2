BaseView = require 'lib/base_view'

# View for a single photo
# Expected options {model, editable}
module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    initialize: (options) ->
        super
        # re-render every time the model change
        @listenTo @model, 'change', -> @render()

    events: =>
        'click btn.delete' : 'destroyModel'
        'click' : (evt) =>
            if not @model.get 'src'
                evt.stopPropagation()
                evt.preventDefault()
                return false



    getRenderData: -> @model.attributes

    afterRender: ->
        @$('a').addClass 'server' if not @model.isNew()

    destroyModel: ->
        @model.destroy()

