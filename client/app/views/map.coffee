BaseView   = require 'lib/base_view'
helpers    = require '../lib/helpers'
baseLayers = require '../lib/map_providers'

module.exports = class MapView extends BaseView

    template: require 'templates/map'
    className: 'masterClass'

    initialize: (options) ->
        super
        @listenTo @collection, 'reset change',  @addAllMarkers
        @markers = new L.MarkerClusterGroup
            disableClusteringAtZoom:    17
            removeOutsideVisibleBounds: false
            animateAddingMarkers:       true

    events: ->
        'click #validate': 'validateChange'


    afterRender: ->
        #define leaflet images folder
        L.Icon.Default.imagePath = 'leaflet-images'
        #define lngitude and latitude to add on a new photo
        @standbyLatlng = new L.latLng(null)
        #define Marker used to add photos on the map
        @standbyMarker = L.marker null,
            draggable: true
            icon: L.divIcon
                className:  'leaflet-marker-div'
                iconSize:   L.point 39, 45
                html:       """
                    <i class="fa fa-crosshairs" style="font-size:3.8em"></i>
                    """

        #map declaration
        @map = L.map this.$('#map')[0],
            center:     [46.8451, 2.4938]
            zoom:       6       # 6 = default zoom
            maxZoom:    17
            minZoom:    2
            layers:     baseLayers["Water color"] #default map background
            maxBounds:  L.latLngBounds [84.26, -170], [-59.888, 192.30]

        @map.on 'contextmenu', (e) =>
            # add marker where user rightclick
            @standbyMarker.setLatLng e.latlng
            @standbyMarker.addTo @map
            @standbyLatlng = e.latlng
            @standbyMarker.bindPopup @standbyLatlng.toString()
            @dispChoiceBox()

            @standbyMarker.on 'move', (e) =>
                #update position when user move cursor
                @standbyMarker.closePopup()
                @standbyLatlng = e.latlng

        @map.on 'click', ()=>
            # hide marker and box with photos
            @hide()

        layerUrl = """
    http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}
    """
        attribution = """
    Tiles by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
        """
        overlays = # map checkables layers
            "Photos": @markers
            "Villes" : L.tileLayer layerUrl,
                type: 'hyb'
                ext: 'png'
                attribution: attribution
                subdomains: '1234'
                opacity: 0.9

        # add control button on the map
        layerControl = L.control.layers baseLayers, overlays,
            position: 'bottomright'
        .addTo @map

        @map.addControl new L.Control.Search
            url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}'
            jsonpParam: 'json_callback'
            propertyName: 'display_name'
            propertyLoc: ['lat','lon']
            markerLocation: true

    addAllMarkers: ->

        @collection.hasGPS().each (photo) =>

            gps      = photo.attributes.gps
            position = new L.LatLng gps.lat, gps.long

            imgPath = "photos/thumbs/#{photo.get('id')}.jpg"
            text    = '<img src="images/spinner.svg" width="150" height="150"/>'
            button  = '<button data-key="' + photo.get('id') +
                '" class="btn btn-block">' +
                '<span class="glyphicon gliphicon-move"></span>' +
                'Relocaliser</button>'

            tempMarker = L.marker position,
                title: photo.get 'title'
            .bindPopup text
            tempMarker.cached = false
            tempMarker.on 'popupopen', ->

                if not tempMarker.cached
                    img = $ '<img src="' + imgPath + '" title="photo"/>'
                    element = $ "<div><p>#{photo.get('title')}</p></div>"
                    description = photo.get 'description'
                    element.append img
                    element.append button
                    unless photo.get('description')?
                    then element.append $ "<quote>#{description}</quote>"
                    img[0].onload = () ->

                        setTimeout () ->

                            tempMarker.getPopup().setContent element[0]
                        , 500
                        tempMarker.cached = true
                    helpers.rotate photo.get('orientation'), img
            @markers.addLayer tempMarker
            @showAll()
        @refresh()

    showAll: ->
        @map.addLayer @markers

    dispChoiceBox: ->

        $('.choice-box').height 'auto'
        mapGalery = this.$('#map-galery')
        mapGalery.children().remove()

        @collection.hasNotGPS().each (photo) ->

            imgPath  = "photos/thumbs/#{photo.get('id')}.jpg"
            mapGalery.append '<img class="map-setter" src="' +\
                imgPath + '" data-key="' + photo.get('id') + '"' +\
                '" style="height: 130px; display: inline"/>'

    $(document).on "click", ".map-setter", ()->
        $(this).toggleClass 'map-photo-checked'

    #Set new GPS coordinate to the photo
    validateChange: (e)->
        console.log e
        that = this

        $(".map-photo-checked").each ()->
            el = $ this
            photo = that.collection.get el.attr('data-key')
            that.standbyLatlng.lng += 0.0001
            photo?.save gps:
                lat:    that.standbyLatlng.lat
                long:   that.standbyLatlng.lng
                alt:    0

            , success: (e) ->
                e.preventDefault()

            , error: (e) ->
                e.preventDefault()
        that.hide()

    # Hide cursor and bottom box
    hide: ->
        $('.choice-box').height 0
        @map.removeLayer @standbyMarker

    refresh: ->
        @map.invalidateSize() # force to load all map tiles


