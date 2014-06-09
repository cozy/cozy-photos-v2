photo = require './photo'
album = require './album'
contact = require './contact'

module.exports =

    # fetch on params
    'albumid': param: album.fetch
    'photoid': param: photo.fetch

    '':
        get: album.index

    'contacts':
        get: contact.list

    'albums/?':
        get: album.list
        post: album.create

    'albums/:albumid/?':
        get: album.read
        put: album.update
        delete: album.delete

    'albums/:albumid.zip':
        get: album.zip

    'photos/?':
        post: photo.create

    'photos/:photoid/?':
        put: photo.update
        delete: photo.delete

    'photos/:photoid.jpg'        : get : photo.screen
    'photos/thumbs/:photoid.jpg' : get : photo.thumb
    'photos/raws/:photoid.jpg'   : get : photo.raw

    'public/?'                          : get : album.index
    'public/albums/?'                   : get : album.list
    'public/albums/:albumid.zip'        : get : album.zip
    'public/albums/:albumid/?'          : get : album.read
    'public/photos/:photoid.jpg'        : get : photo.screen
    'public/photos/thumbs/:photoid.jpg' : get : photo.thumb
    'public/photos/raws/:photoid.jpg'   : get : photo.raw
