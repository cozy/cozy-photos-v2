module.exports = class PhotoCollection extends Backbone.Collection

    model: require 'models/photo'
    url: 'photos'
