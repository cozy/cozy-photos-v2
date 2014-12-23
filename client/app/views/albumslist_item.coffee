BaseView = require 'lib/base_view'
{limitLength} = require 'lib/helpers'
helpers = require 'lib/helpers'

# Item View for the albums list
module.exports = class AlbumItem extends BaseView
    className: 'albumitem'
    template: require 'templates/albumlist_item'

    initialize: ->
        @listenTo @model, 'change', => @render()

    getRenderData: ->
        out = _.clone @model.attributes
        out.description = limitLength out.description, 250
        out.thumbsrc =  @model.getThumbSrc()
        # Album is recent if it has been updated in less than 60s
        out.isRecent = if (out.updated? and out.updated - Date.now() < 60000) then 'recent' else ''
        return out

    afterRender: ->
        @image = @$ 'img'
        @image.attr 'src', @model.getThumbSrc()
        helpers.rotate @model.attributes.orientation, @image
