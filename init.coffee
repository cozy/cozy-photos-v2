# define requests here

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
    emit [photo.albumid, photo._id], photo

Photo.defineRequest 'byalbum', byAlbumMap, (err) ->
    if err
        console.log 'failed to create request "byalbum" for photos'
        console.log err.stack

album = new Album
    title: 'Jura'
    description: 'Some pictures from our hollidays in Jura'

Album.create album, (err, final) ->
    console.log 'album created'
    console.log final.title
    console.log err.stack if err