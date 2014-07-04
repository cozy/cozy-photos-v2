Album = require '../models/album'
CozyInstance = require '../models/cozy_instance'
User = require '../models/user'
clearance = require 'cozy-clearance'
localization = require '../lib/localization_manager'

try CozyAdapter = require('americano-cozy/node_modules/jugglingdb-cozy-adapter')
catch e then CozyAdapter = require('jugglingdb-cozy-adapter')


# check that doc is viewable by req
# doc is visible iff any of itself or its parents is viewable
module.exports.checkClearance = (doc, req, perm, callback)  ->

    if typeof perm is "function"
        callback = perm
        perm = 'r'

    clearance.check doc, perm, req, (err, result) ->
        if result # the file itself is visible
            callback true
        else
            callback false
