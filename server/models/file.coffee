cozydb = require 'cozydb'

module.exports = class File extends cozydb.CozyModel
    @schema:
        id                : String
        name              : String
        path              : String
        lastModification  : String
        binary            : cozydb.NoSchema
        class             : String

    @imageByDate: (options, callback) ->
        File.request 'imageByDate', options, callback

    @withoutThumb: (callback) ->
        File.request 'withoutThumb', {}, callback
