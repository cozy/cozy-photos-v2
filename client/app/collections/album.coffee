module.exports = class AlbumCollection extends Backbone.Collection

    model: require 'models/album'
    url: 'albums'