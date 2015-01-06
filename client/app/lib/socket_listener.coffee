contactCollection = require 'cozy-clearance/contact_collection'

module.exports = class ContactListener extends CozySocketListener

    events: [
        'contact.create'
        'contact.update'
        'contact.delete'
    ]

    process: (event) ->
        if event.doctype is 'contact'
            contactCollection.handleRealtimeContactEvent event