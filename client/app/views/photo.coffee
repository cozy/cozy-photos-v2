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
        'click' : 'onClickListener'
        'click btn.delete' : 'destroyModel'

    getRenderData: -> @model.attributes

    afterRender: ->
        @$('a').removeClass 'loading server'

        className = if @model.isNew() then 'loading' else 'server'
        @$('a').addClass className

    onClickListener: (evt) =>
        if not @model.get 'src'
            evt.stopPropagation()
            evt.preventDefault()
            return false

    destroyModel: ->
        @model.destroy()

