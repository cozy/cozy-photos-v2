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
        @listenTo @model, 'progress',        @onProgress
        @listenTo @model, 'thumbed',         @onThumbed
        @listenTo @model, 'upError',         @onError
        @listenTo @model, 'uploadComplete',  @onServer
        @listenTo @model, 'change',          => @render()

    events: =>
        'click' : 'onClickListener'
        'click .delete' : 'destroyModel'

    getRenderData: -> @model.attributes

    afterRender: ->
        @link =        @$ 'a'
        @image =       @$ 'img'
        @progressbar = @$ '.progressfill'
        helpers.rotate @model.get('orientation'), @image
        @link.addClass 'server' unless @model.isNew()

    setProgress: (percent) ->
        @progressbar.css 'height', percent + '%'

    # when the upload progresses
    onProgress: (event) ->
        @setProgress 10 + 90 * event.loaded / event.total

    # when the thumb is ready
    onThumbed: ->
        @setProgress 10
        @image.attr 'src', @model.thumb_du
        @image.attr 'orientation', @model.get('orientation')
        @image.addClass 'thumbed'

    # when the upload is complete
    onServer: ->
        # detach-reatach so photobox can pick up the object
        col = @model.collection
        col.remove @model
        col.add @model

        # @setProgress 0
        # @link.attr 'href', "photos/#{@model.id}.jpg"
        # @image.attr 'src', "photos/thumbs/#{@model.id}.jpg"

    # when an error occured
    onError: (err) ->
        @setProgress 0
        @error = @model.get('title') + " " + err
        @link.attr 'title', @error
        @image.attr 'src', 'img/error.gif'

    # prevent openning the gallery if the photos
    # hasn't been upload yet
    onClickListener: (evt) =>
        if @model.isNew()
            alert @error if @error
            evt.stopPropagation()
            evt.preventDefault()
            return false

    destroyModel: ->
        @model.destroy()

