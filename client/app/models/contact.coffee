client = require "../helpers/client"
# A photo
# maintains attributes src / thumbsrc depending of the state of the model
module.exports = class Contact extends Backbone.Model

    list: (callback)->
        client.get "contacts", callback