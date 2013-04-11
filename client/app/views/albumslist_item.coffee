BaseView = require 'lib/base_view'
{limitLength} = require 'lib/helpers'

# Item View for the albums list

module.exports = class AlbumItem extends BaseView
    className: 'albumitem media'
    template: require 'templates/albumlist_item'
    initialize: ->
        @listenTo @model, 'change', => @render()

    events: =>
        'click btn.delete' : => @model.destroy()

    getRenderData: ->
        out = @model.attributes
        if out.thumb?
            out.thumbsrc = "photos/thumbs/#{out.thumb}.jpg"
        else
            out.thumbsrc = "img/nophotos.gif"
        out.description = limitLength out.description, 250
        return out