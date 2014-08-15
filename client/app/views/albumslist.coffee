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

    checkIfEmpty: =>
        @$('.help').toggle _.size(@views) is 0 and app.mode is 'public'

    afterRender: ->
        super
        @resize()

    resize: ->
        wWidth = $(document).width()
        nbPhotosByLine = Math.ceil wWidth / 300
        @$('.albumitem').width wWidth / nbPhotosByLine
        @$('.albumitem a').width wWidth / nbPhotosByLine
        @$('.albumitem span').width wWidth / nbPhotosByLine
        @$('.albumitem').height wWidth / nbPhotosByLine
        @$('.albumitem a').height wWidth / nbPhotosByLine
        @$('.albumitem span').height wWidth / nbPhotosByLine
