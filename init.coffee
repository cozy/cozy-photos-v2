Photo = require './server/models/photo'
File = require './server/models/file'
thumb = require('./server/controllers/file').createThumb
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
        async.each(docs, convert, cb)

createThumb = (cb) ->
    File.all (err, files) ->
        async.each files, thumb, cb

# Create all requests and upload directory
module.exports.convert = (done = ->) ->
    convertImage (err) ->
        createThumb () ->
            done()