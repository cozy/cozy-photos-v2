fs = require 'fs'
async = require 'async'
Album = require './server/models/album'
Photo = require './server/models/photo'

# MapReduce's map for "all" request
allMap = (doc) -> emit doc._id, doc

# MapReduce's map to fetch photos by albumid
byAlbumMap = (photo) -> emit photo.albumid, photo

# MapReduce to fetch thumbs for every album
albumPhotosRequest =
    map: (photo) -> emit photo.albumid, photo._id
    reduce: (key, values, rereduce) -> values[0]

# Create all requests and upload directory
module.exports = init = (done = ->) ->
    async.parallel [
        (cb) -> Album.defineRequest 'all', allMap, cb
        (cb) -> Photo.defineRequest 'all', allMap, cb
        (cb) -> Photo.defineRequest 'byalbum', byAlbumMap, cb
        (cb) -> Photo.defineRequest 'albumphotos', albumPhotosRequest, cb
        (cb) -> fs.mkdir './uploads', (err) ->
            err = null if err?.code is 'EEXIST'
            cb(err)
    ], (err) ->
        if err
            console.log "Something went wrong"
            console.log err
            console.log '-----'
            console.log err.stack
        else
            console.log "Requests have been created"

        done(err)

# so we can do "coffee init"
init() if not module.parent