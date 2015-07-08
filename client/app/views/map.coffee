BaseView = require 'lib/base_view'

module.exports = class MapView extends BaseView

    template: require 'templates/map'
    className: 'masterClass'

    homePosition: [46.8451, 2.4938]

    initialize: (options) ->
        super
        @listenTo @collection, 'reset',  @addAllMarkers
        @markers = new L.MarkerClusterGroup
            disableClusteringAtZoom: 17
            removeOutsideVisibleBounds: false
            animateAddingMarkers: true

    afterRender: -> # action quand le dom est pret

        L.Icon.Default.imagePath = 'images/leaflet-images/'

        watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
            attribution: 'Map by <a href="http://stamen.com">Stamen Design</a>'
            subdomains: 'abcd'
            minZoom: 1
            maxZoom: 17
            ext: 'png'
        })

        OpenStreetMapHot = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'Map by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })

        @map = L.map this.$('#map')[0],
            center: @homePosition
            zoom: 6 # 6 = default zoom
            maxZoom: 17
            layers: watercolor


        baseLayers =
            "Watercolor": watercolor
            "OSM Hot"   : OpenStreetMapHot

        overlays =
            "Photos": @markers,

        layerControl = L.control.layers(baseLayers, overlays, {position: 'bottomright'}).addTo(@map);
        ###
        L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 17,
            ext: 'png'
            maxBounds: [
                [40.712, -74.227],
                [48.774, 6.125]
            ]
        }).addTo( @map )


        baseLayers = {
            "Mapbox": mapbox,
            "OpenStreetMap": osm
        };
        overlays = {
            "Marker": marker,
            "Roads": roadsLayer
        }
        L.control.layers(baseLayers, overlays).addTo(map);
        ###

    addAllMarkers: ->

        @collection.each (photo) =>

            gps = photo.attributes.gps
            console.info photo
            if gps?.lat?
                pos  = new L.LatLng(gps.lat, gps.long)
                text = photo.get('title') + '<img src="photos/thumbs/' + photo.get('id') + '.jpg">'
                tempMarker = L.marker( pos, { title: text }).bindPopup(text)
                @markers.addLayer tempMarker
        @showAll()

    showAll: ->
        @map.addLayer @markers
        # force to load all map tiles {debounceMoveend: true}
        @map.invalidateSize()
###

        _.each @markers, (marker, value) =>
            console.log marker
            marker.addTo @map

        http://{s}.tile.osm.org/{z}/{x}/{y}.png
        https://{s}.tiles.mapbox.com/v3/examples.map-20v6611k/{z}/{x}/{y}.png                 https://{s}.tiles.mapbox.com/v3/examples.map-i875mjb7/{z}/{x}/{y}.png
        http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png
            <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
        # pour les trouver
        http://leaflet-extras.github.io/leaflet-providers/preview/
###
