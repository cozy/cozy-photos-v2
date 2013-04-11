ViewCollection = require 'lib/view_collection'

# "Home" view : the list of album
# simple ViewCollection
# pass editable options to children

module.exports = class AlbumsList extends ViewCollection
    id: 'album-list'
    itemview: require 'views/albumslist_item'
    template: require 'templates/albumlist'

    itemViewOptions: ->
        editable: @options.editable

