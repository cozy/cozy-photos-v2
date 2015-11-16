async = require 'async'
clearance = require 'cozy-clearance'
cozydb = require 'cozydb'
fs = require 'fs'

Album = require '../models/album'

localizationManager = require '../helpers/localization_manager'


getUser = (callback) ->
    cozydb.api.getCozyUser (err, user) ->
        return callback err if err

        if user?.public_name and user.public_name.length > 0
            callback null,
                name:  user.public_name
                email: user.email
        else
            localizationManager.ensureReady (err) ->
                callback null,
                    name: localizationManager.t 'default user name'
                    email: null


clearanceCtl = clearance.controller
    mailTemplate: (options, callback) ->
        getUser (err, user) ->
            if err?
                callback err
            else
                options.displayName = user.name
                options.displayEmail= user.email
                localizationManager.render 'sharemail', options, callback

    mailSubject: (options, callback) ->
        getUser (err, user) ->
            if err?
                callback err
            else
                # Need to force locale to be loaded before executing callback
                localizationManager.ensureReady (err) ->
                    callback null, localizationManager.t 'email sharing subject',
                        displayName: user.name
                        name: options.doc.title

    attachments: [
        path: fs.realpathSync './build/client/public/img/cozy-logo.png'
        filename: 'cozy-logo.png'
        cid: 'cozy-logo'
    ]

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
module.exports.checkPermissionsPhoto = (photo, perm, req, callback) ->
    # owner can do everything
    return callback null, true unless req.public

    # public request are handled by cozy-clearance
    albumid = photo.albumid
    incache = cache[albumid]
    if incache
        clearance.check {clearance: incache}, perm, req, callback
    else
        Album.find albumid, (err, album) ->
            return callback null, false if err or not album
            if album.clearance is 'hidden'
                album.clearance = 'public'

            if album.clearance is 'private'
                album.clearance = []
            cache[albumid] = album.clearance
            clearance.check album, perm, req, callback

# overrige clearanceCtl to clear cache
module.exports.change = (req, res, next) ->
    cache[req.params.shareid] = null
    clearanceCtl.change req, res, next

module.exports.sendAll = clearanceCtl.sendAll
module.exports.contactList = clearanceCtl.contactList
module.exports.contact = clearanceCtl.contact
module.exports.contactPicture = clearanceCtl.contactPicture
