# AlbumCollection
# is a collection of Albums (models/album)
# define the endpoint where Backbone will fetch the list of album

module.exports = class AlbumCollection extends Backbone.Collection

    model: require 'models/album'
    url: 'albums' + app.urlKey
