Contact = require '../models/contact'
async = require 'async'
fs = require 'fs'

module.exports.list = (req, res) ->
    Contact.all (err, contacts) =>
        return res.error 500, 'An error occured', err if err
        return res.error 404, 'Contact not found' if not contacts

        res.send contacts, 201
