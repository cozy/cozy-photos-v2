BaseView = require 'lib/base_view'

module.exports = class MapView extends BaseView
    template: require 'templates/map'
    className: 'container-fluid'

    allPhotos = this.collection

    initialize: (options) ->
        super

    afterRender: -> # action quand le dom est pret

       # @map = L.map('map').setView([51.505, -0.09], 13);
        console.log 'function showmap'
