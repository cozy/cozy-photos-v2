americano = require 'americano-cozy'

module.exports = File = americano.getModel 'File',
    id                : String
    name              : String
    path              : String
    lastModification  : String
    binary            : Object
    class              : String

File.imageByDate = (callback) ->
    File.request 'imageByDate', {}, callback

File.withoutThumb = (callback) ->
    File.request 'withoutThumb', {}, callback
