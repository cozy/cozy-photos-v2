Photo = require './server/models/photo'
async = require 'async'

convertImage = (cb) ->
    convert = (doc, callback) ->
        if doc._attachments?
            try
                console.log "Convert #{doc.title} ..."
                doc.convertBinary (err, res, body) ->
                    console.log err if err?
                    callback err
            catch
                console.log "Cannot convert #{doc.title}"
                callback()
        else
            callback()
    Photo.all (err, docs) ->
        async.each(docs, convert, cb)

# Create all requests and upload directory
module.exports.convert = (done = ->) ->
    convertImage (err) ->
        done()