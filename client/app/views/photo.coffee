BaseView = require 'lib/base_view'
helpers = require 'lib/helpers'

transitionendEvents = [
    "transitionend", "webkitTransitionEnd", "oTransitionEnd", "MSTransitionEnd"
].join(" ")

# View for a single photo
# Expected options {model, editable}
module.exports = class PhotoView extends BaseView
    template: require 'templates/photo'
    className: 'photo'

    initialize: (options) ->
        super
        @listenTo @model, 'change:progress', @onProgress
        @listenTo @model, 'change:thumbsrc', @onSrcChanged
        @listenTo @model, 'change:src',      @onSrcChanged
        @listenTo @model, 'change:state',    @onStateChanged

    events: =>
        'click' : 'onClickListener'
        'click .delete' : 'destroyModel'

    getRenderData: -> @model.attributes

    afterRender: ->
        @link =        @$ 'a'
        @image =       @$ 'img'
        @progressbar = @$ '.progressfill'
        @link.removeClass 'loading thumbed server error'
        @link.addClass @model.get 'state'
        helpers.rotate @model.get('orientation'), @image

    onProgress: (model) ->
        p = 10 + 90*model.get('progress')
        @progressbar.css 'height', p + '%'

    onStateChanged: (model) ->

        @link.removeClass 'loading thumbed server error'
        @link.addClass @model.get 'state'
        helpers.rotate @model.get('orientation'), @image


        if model.get('state') is 'thumbed'
            @progressbar.css 'height', '10%'

        if model.previous('state') is 'thumbed' and
           model.get('state')      is 'server'

            @progressbar.css 'height', '100%'
            setTimeout =>
                @progressbar.hide()
            , 500

    onSrcChanged: (model) ->
        @link.attr 'href', model.get 'src'
        @image.attr 'src', model.get 'thumbsrc'

    onClickListener: (evt) =>
        unless @model.get('state') is 'server'
            evt.stopPropagation()
            evt.preventDefault()
            return false

    destroyModel: ->
        @model.destroy()

