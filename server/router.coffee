module.exports = (app) ->
    photo = require('./controllers/photo')(app)
    album = require('./controllers/album')(app)

    # fetch on params
    app.param 'albumid',                                    album.fetch
    app.param 'photoid',                                    photo.fetch

    # editor routes
    app.get   '/albums/?',                                  album.list
    app.post  '/albums/?',                                  album.create
    app.post  '/albums/share/?',                           album.sendMail
    app.get   '/albums/:albumid.zip',                       album.zip
    app.get   '/albums/:albumid/?',                         album.read
    app.put   '/albums/:albumid/?',                         album.update
    app.del   '/albums/:albumid/?',                         album.delete

    app.post  '/photos/?',                                  photo.create
    app.get   '/photos/:photoid.jpg',                       photo.screen
    app.get   '/photos/thumbs/:photoid.jpg',                photo.thumb
    app.put   '/photos/:photoid/?',                         photo.update
    app.del   '/photos/:photoid/?',                         photo.delete

    # public routes
    app.get   '/public/albums/:albumid.zip',                album.zip
    app.get   '/public/albums/?',                           album.list
    app.get   '/public/albums/:albumid/?',                  album.read
    app.get   '/public/photos/:photoid.jpg',                photo.screen
    app.get   '/public/photos/thumbs/:photoid.jpg',         photo.thumb