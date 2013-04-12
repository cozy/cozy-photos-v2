BaseView = require 'lib/base_view'
{limitLength} = require 'lib/helpers'

# Item View for the albums list
module.exports = class AlbumItem extends BaseView
    className: 'albumitem media'
    template: require 'templates/albumlist_item'

    initialize: ->
        @listenTo @model, 'change', => @render()

    events: =>
        'click btn.delete' : 'destroyModel'

    getRenderData: ->
        out = _.clone @model.attributes
        out.description = limitLength out.description, 250
        return out

    destroyModel: ->
        if confirm 'Are you sure ?'
            @model.destroy()