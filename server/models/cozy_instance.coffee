americano = require 'americano-cozy'

module.exports = CozyInstance = americano.getModel 'CozyInstance',
    locale : String

CozyInstance.getLocale = (callback) ->
    CozyInstance.request 'all', (err, instances) ->
        console.log err if err
        callback null, instances?[0]?.locale or 'en'
