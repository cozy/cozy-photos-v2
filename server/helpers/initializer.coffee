Photo = require '../models/photo'
File = require '../models/file'
thumb = require('./thumb').create
async = require 'async'


convertImage = (cb) ->

    convert = (doc, callback) ->
        if doc._attachments?
            try
                console.log "Convert #{doc.title} ..."
                doc.convertBinary (err, res, body) ->
                    console.log err if err?
                    callback err
            catch error
                console.log "Cannot convert #{doc.title}"
                callback()
        else
            callback()

    Photo.all (err, docs) ->
        if err
            cb err
        else
            async.eachSeries docs, convert, cb

# Create all requests and upload directory
module.exports.convert = (socket, done= -> null) ->
    #convertImage (err) ->
    done()
