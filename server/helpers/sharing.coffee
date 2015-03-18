Album = require '../models/album'
clearance = require 'cozy-clearance'


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
