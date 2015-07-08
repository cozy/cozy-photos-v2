BaseView = require 'lib/base_view'
helpers  = require '../lib/helpers'

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

        L.Icon.Default.imagePath = 'leaflet-images'

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

        EsriWorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
        })

        @map = L.map this.$('#map')[0],
            center: @homePosition
            zoom: 6 # 6 = default zoom
            maxZoom: 17
            layers: watercolor


        baseLayers =
            "Watercolor": watercolor
            "OSM Hot"   : OpenStreetMapHot
            "Esri world": EsriWorldImagery

        overlays =
            "Photos": @markers,

        layerControl = L.control.layers(baseLayers, overlays, {position: 'bottomright'}).addTo(@map);


    addAllMarkers: ->

        @collection.each (photo) =>

            gps = photo.attributes.gps
            #console.info photo
            if gps?.lat?
                pos  = new L.LatLng(gps.lat, gps.long)
                imgPath = "photos/thumbs/#{photo.get('id')}.jpg"
                text = '<img src="images/spinner.svg" width="100%", height="100%" title="waiting..." />'
                tempMarker = L.marker( pos, { title: text }).bindPopup(text)
                tempMarker.cached = false
                tempMarker.on 'popupopen', ->

                    if not tempMarker.cached
                        img = $ '<img src="' + imgPath + '" title="photo"/>'
                        element = $ "<div>#{photo.get('title')}</div>"
                        element.append img
                        img[0].onload = ()->

                            setTimeout ()=>

                                tempMarker.getPopup().setContent element[0]
                            , 500
                            tempMarker.cached = true
                        helpers.rotate photo.get('orientation'), img
                        console.log "ORIENTATION: #{photo.get('title')} - #{photo.get('orientation')}"
                @markers.addLayer tempMarker
            @showAll()
            @map.invalidateSize()

    showAll: ->
        @map.addLayer @markers
        # force to load all map tiles
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
