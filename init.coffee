# define requests here
fs = require 'fs'
Album = require './server/models/album'
Photo = require './server/models/photo'

allMap = (doc) ->
    emit doc._id, doc
    return

Album.defineRequest 'all', allMap, (err) ->
    if err
        console.log 'failed to create request "all" for albums'
        console.log err.stack

Photo.defineRequest 'all', allMap, (err) ->
    if err
        console.log 'failed to create request "all" for photos'
        console.log err.stack

byAlbumMap = (photo) ->
    emit photo.albumid, photo

Photo.defineRequest 'byalbum', byAlbumMap, (err) ->
    if err
        console.log 'failed to create request "byalbum" for photos'
        console.log err.stack

fs.mkdir './uploads'