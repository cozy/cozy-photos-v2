app = require 'application'
BaseView = require 'lib/base_view'
ViewCollection = require 'lib/view_collection'
Album = require 'models/album'
{limitLength} = require 'lib/helpers'

# Item View
class AlbumItem extends BaseView
    className: 'albumitem media'
    template: require 'templates/albumlist_item'
    initialize: ->
        @model.on 'change', => @render()

    events: =>
        'click btn.delete' : => @model.destroy()

    getRenderData: ->
        out = @model.attributes
        out.thumbsrc = "photos/thumbs/#{out.thumb}.jpg"
        out.description = limitLength out.description, 250
        return out

# Collection View
module.exports = class AlbumList extends ViewCollection
    id: 'album-list'
    itemview: AlbumItem
    template: require 'templates/albumlist'

    itemViewOptions: -> editable: @options.editable
