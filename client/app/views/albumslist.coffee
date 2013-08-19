ViewCollection = require 'lib/view_collection'
app = require 'application'

# "Home" view : the list of album
# simple ViewCollection
# pass editable options to children

module.exports = class AlbumsList extends ViewCollection
    id: 'album-list'
    itemView: require 'views/albumslist_item'
    template: require 'templates/albumlist'

    initialize: ->
        super

    # place the items before the create buttona
    # in reverse creation order
    appendView: (view) ->
        @$el.append view.el

    checkIfEmpty: =>
        @$('.help').toggle _.size(@views) is 0 and app.mode is 'public'
