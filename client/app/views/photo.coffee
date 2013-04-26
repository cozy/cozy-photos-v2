BaseView = require 'lib/base_view'

# View for a single photo
# Expected options {model, editable}
module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    initialize: (options) ->
        super
        @listenTo @model, 'change', @onChange

    events: =>
        'click' : 'onClickListener'
        'click btn.delete' : 'destroyModel'

    getRenderData: -> @model.attributes

    onChange: ->
        if @model.hasChanged 'progress'
            percent = @model.get('progress') * 100 + '%'
            @$('a .progressfill').css 'height', percent

        else
            # re-render every time the model change
            console.log 're-render'
            @render()

    afterRender: ->
        @$('a').removeClass('loading thumbed server')
        .addClass @model.get 'state'

    onClickListener: (evt) =>
        unless @model.get('state') is 'server'
            evt.stopPropagation()
            evt.preventDefault()
            return false

    destroyModel: ->
        @model.destroy()

