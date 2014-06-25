async = require 'async'
clearance = require 'cozy-clearance'

Album = require '../models/album'
User = require '../models/user'

localization = require '../helpers/localization_manager'
MailTemplate = localization.getEmailTemplate 'sharemail.jade'

clearanceCtl = clearance.controller
    mailTemplate: (options, callback) ->
        User.getDisplayName (err, displayName) ->
            options.displayName = displayName or \
                                  localization.t 'default user name'
            options.localization = localization
            callback null, mailTemplate options

    mailSubject: (options, callback) ->
        name = options.doc.title
        User.getDisplayName (err, displayName) ->
            displayName = displayName or localization.t 'default user name'
            callback null, localization.t 'email sharing subject',
                displayName: displayName
                name: name

# fetch file or folder, put it in req.doc
module.exports.fetch = (req, res, next, id) ->
    Album.find id, (err, album) ->
        if album
            req.doc = album
            next()
        else
            err = new Error 'bad usage'
            err.status = 400
            next err

module.exports.sendAll = clearanceCtl.sendAll
module.exports.contactList = clearanceCtl.contactList
module.exports.contactPicture = clearanceCtl.contactPicture
