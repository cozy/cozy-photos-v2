Contact = require '../models/contact'
async = require 'async'
fs = require 'fs'

module.exports.list = (req, res, next) ->
    Contact.all (err, contacts) =>
        if err
            next err
        else if not contacts
            err = new Error "Contacts not found"
            err.status = 404
            next err

        else
            res.send contacts
