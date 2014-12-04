Photo = require './server/models/photo'
File = require './server/models/file'
thumb = require('./server/helpers/thumb').create
async = require 'async'

onThumbCreation = false
percent = null
total_files = 0
thumb_files = 0

module.exports.onThumbCreation = () ->
    #return [true, 50]
    return [onThumbCreation, Math.floor((thumb_files/total_files)*100)]

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

createThumb = (cb) =>
    File.imageByDate (err, files) =>
        total_files = files.length
        async.eachSeries files, (file, callback) =>
            thumb file, () =>
                thumb_files += 1
                callback()
        , cb

# Create all requests and upload directory
module.exports.convert = (done = ->) =>
    #convertImage (err) ->
    onThumbCreation = true
    createThumb () =>
        onThumbCreation = false
        done()