module.exports = (app) ->
    photo = require './controllers/photo'
    album = require './controllers/album'

    app.param 'albumid',                                    album.fetch
    app.param 'photoid',                                    photo.fetch

    app.get   '/albums/?',                                  album.list
    app.post  '/albums/?',                                  album.create
    app.get   '/albums/:albumid/?',                         album.read
    app.get   '/albums/:albumid/photos/?',                  album.photos
    app.put   '/albums/:albumid/?',                         album.update
    app.del   '/albums/:albumid/?',                         album.delete


    app.post  '/photos/?',                                  photo.create
    app.get   '/photos/:photoid.jpg',                       photo.raw
    app.get   '/photos/thumbs/:photoid.jpg',                photo.thumb
    app.put   '/photos/:photoid/?',                         photo.update
    app.del   '/photos/:photoid/?',                         photo.delete
