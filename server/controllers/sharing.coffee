async = require 'async'
clearance = require 'cozy-clearance'

Album = require '../models/album'
User = require '../models/user'

LocalizationManager = require '../helpers/localization_manager'
localization = new LocalizationManager

clearanceCtl = clearance.controller
    mailTemplate: (options, callback) ->
        console.log options
        localization.initialize ->
            mailTemplate = localization.getEmailTemplate 'sharemail.jade'
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

# fetch album, put it in req.doc
module.exports.fetch = (req, res, next, id) ->
    Album.find id, (err, album) ->
        if album
            req.doc = album
            next()
        else
            err = new Error 'bad usage'
            err.status = 400
            next err

# middleware to mark public request as such
module.exports.markPublicRequests = (req, res, next) ->
    req.public = true if req.url.match /^\/public/
    next()

module.exports.checkPermissions = (album, req, callback) ->
    # owner can do everything
    return callback null, true unless req.public

    if album.clearance is 'hidden'
        album.clearance = 'public'

    if album.clearance is 'private'
        album.clearance = []

    # public request are handled by cozy-clearance
    clearance.check album, 'r', req, callback

# we cache album's clearance to avoid extra couchquery
cache = {}
module.exports.checkPermissionsPhoto = (photo, req, callback) ->
    # owner can do everything
    return callback null, true unless req.public

    # public request are handled by cozy-clearance
    albumid = photo.albumid
    if incache = cache[albumid]
        clearance.check {clearance: incache}, 'r', req, callback
    else
        Album.find albumid, (err, album) ->
            return callback null, false if err or not album
            if album.clearance is 'hidden'
                album.clearance = 'public'

            if album.clearance is 'private'
                album.clearance = []
            cache[albumid] = album.clearance
            clearance.check album, 'r', req, callback

# overrige clearanceCtl to clear cache
module.exports.change = (req, res, next) ->
    cache[req.params.shareid] = null
    clearanceCtl.change req, res, next

module.exports.sendAll = clearanceCtl.sendAll
module.exports.contactList = clearanceCtl.contactList
module.exports.contactPicture = clearanceCtl.contactPicture
