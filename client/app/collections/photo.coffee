# PhotoCollection
# is a collection of Photos (models/photo)
# define the endpoint where Backbone will fetch the list of photos

module.exports = class PhotoCollection extends Backbone.Collection

    model: require 'models/photo'
    url: 'photos'
    comparator: (model) -> model.get 'title'
