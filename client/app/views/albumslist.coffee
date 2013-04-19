ViewCollection = require 'lib/view_collection'

# "Home" view : the list of album
# simple ViewCollection
# pass editable options to children

module.exports = class AlbumsList extends ViewCollection
    id: 'album-list'
    itemView: require 'views/albumslist_item'
    template: require 'templates/albumlist'

    initialize: ->
        super

    # place the items before the create button
    appendView: (view) ->
        @$el.prepend view.el
