Album = require './server/models/album'

# Create all requests and upload directory
module.exports = init = (done = ->) ->
    Album.all (err, albums) ->
        retur done err if err
        found = false
        found = true for album in albums when album.folderid is "all"
        if not found
            album =
                docType : "Album"
                title : "Toutes mes photos"
                description: "L'ensemble des photos"
                clearance: "private"
                orientation: 1
                folderid : "all"
            Album.create album, (err, album) ->
                if err
                    console.log "Something went wrong"
                    console.log err
                    console.log '-----'
                    console.log err.stack
                    return done err
                else
                    console.log "First album have been created"
                    done()

# so we can do "coffee init"
init() if not module.parent
