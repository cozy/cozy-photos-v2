BaseView = require 'lib/base_view'

module.exports = class MapView extends BaseView

    template: require 'templates/map'
    className: 'masterClass'

    initialize: (options) ->
        super
        @listenTo @collection, 'reset',  @addAllMarkers
        @map = {}
        @markers = []

    afterRender: -> # action quand le dom est pret
        #console.log 'function showmap'
        L.Icon.Default.imagePath = 'javascripts/images';

        @map = L.map( this.$('#map')[0] ).setView([46.8451, 2.4938], 6);

        L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 16,
            ext: 'png'
        }).addTo( @map );

    addAllMarkers: ->

        console.log @markers
        @collection.each (photo) =>
            gps = photo.attributes.gps
            console.info photo
            if gps?.lat?
                pos  = new L.LatLng(gps.lat, gps.long)
                text = photo.get('title')
                @markers.push new L.marker( pos ).bindPopup(text)
            #L.marker([46, 2]).addTo( map);
        @showAll()

    showAll: ->
        _.each @markers, (marker, value) =>
            console.log marker
            marker.addTo @map


###
        http://{s}.tile.osm.org/{z}/{x}/{y}.png
        https://{s}.tiles.mapbox.com/v3/examples.map-20v6611k/{z}/{x}/{y}.png                 https://{s}.tiles.mapbox.com/v3/examples.map-i875mjb7/{z}/{x}/{y}.png
        http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png
            <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
        # pour les trouver
        http://leaflet-extras.github.io/leaflet-providers/preview/
###
