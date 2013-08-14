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
        return out    


    afterRender: ->
        @image = @$ 'img' 
        @image.attr 'src', @model.attributes.thumbsrc
        helpers.rotate @model.attributes.orientation, @image