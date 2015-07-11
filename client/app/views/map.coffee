BaseView   = require 'lib/base_view'
helpers    = require '../lib/helpers'
baseLayers = require '../lib/map_providers'

module.exports = class MapView extends BaseView

    template: require 'templates/map'
    className: 'masterClass'

    initialize: (options) ->
        super
        @listenTo @collection, 'reset',  @addAllMarkers
        #@listenTo 'route:map', # ?????
        @markers = new L.MarkerClusterGroup
            disableClusteringAtZoom: 17
            removeOutsideVisibleBounds: false
            animateAddingMarkers: true

    afterRender: ->

        #define leaflet images folder
        L.Icon.Default.imagePath = 'leaflet-images'
        #define lngitude and latitude to add on a new photo
        standbyLatlng = new L.latLng(null)
        #define Marker used to add photos on the map
        @standbyMarker = L.marker null,
            draggable: true
            icon: L.divIcon
                className: 'leaflet-marker-div'
                iconSize: L.point 39, 45
                html: '<i class="fa fa-crosshairs" style="font-size:3.8em"></i>'

        #map declaration
        @map = L.map this.$('#map')[0],
            center: [46.8451, 2.4938]
            zoom: 6       # 6 = default zoom
            maxZoom: 17
            layers: baseLayers["Water color"] #default map background

        @map.on 'contextmenu', (e)=>
            # add marker where user rightclick
            @standbyMarker.setLatLng e.latlng
            @standbyMarker.addTo @map
            standbyLatlng = e.latlng
            @standbyMarker.bindPopup standbyLatlng.toString()
            @dispChoiceBox()

            @standbyMarker.on 'move', (e)=>
                #update position when user move cursor
                console.log e.latlng
                @standbyMarker.closePopup()
                standbyLatlng = e.latlng

        @map.on 'click', ()=>
            @hide()

        overlays = # map checkables layers
            "Photos": @markers,

        #add control button on the map
        layerControl = L.control.layers baseLayers, overlays,
            position: 'bottomright'
        .addTo @map

    addAllMarkers: ->

        @collection.hasGPS().each (photo) =>

            gps = photo.attributes.gps
            if gps?.lat?

                position = new L.LatLng(gps.lat, gps.long)
                imgPath  = "photos/thumbs/#{photo.get('id')}.jpg"
                text     = '<img src="images/spinner.svg" width="150" height="150"/>'
                tempMarker = L.marker position,
                    title: photo.get 'title'
                .bindPopup text
                tempMarker.cached = false
                tempMarker.on 'popupopen', ->

                    if not tempMarker.cached
                        img = $ '<img src="' + imgPath + '" title="photo"/>'
                        element = $ "<div>#{photo.get('title')}</div>"
                        element.append img
                        unless photo.get('description')? then element.append $ "<quote>#{photo.get('description')}</quote>"
                        img[0].onload = ()->

                            setTimeout ()=>

                                tempMarker.getPopup().setContent element[0]
                            , 500
                            tempMarker.cached = true
                        helpers.rotate photo.get('orientation'), img
                @markers.addLayer tempMarker
            @showAll()
            @map.invalidateSize() # force to load all map tiles

    showAll: ->
        @map.addLayer @markers

    dispChoiceBox: ->
        console.log 'coucou'
        $('.choice-box').height 150

    hide: ->
        $('.choice-box').height 0
        @map.removeLayer @standbyMarker


