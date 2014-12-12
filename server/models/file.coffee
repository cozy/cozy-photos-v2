americano = require 'americano-cozy'

module.exports = File = americano.getModel 'File',
    id                : String
    name              : String
    path              : String
    lastModification  : String
    binary            : Object
    class              : String

File.imageByDate = (options, callback) ->
    File.request 'imageByDate', options, callback

File.withoutThumb = (callback) ->
    File.request 'withoutThumb', {}, callback
