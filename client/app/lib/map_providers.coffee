###
    This file permit to add lots of map background, you can copy-paste
    code from 'http://leaflet-extras.github.io/leaflet-providers/preview/'
    and add a nex entry in this array, the default background is the first
    indice.
###
module.exports =

    'Water color': L.tileLayer 'http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
        attribution: 'Map by <a href="http://stamen.com">Stamen Design</a>'
        subdomains: 'abcd'
        ext: 'png'
        maxZoom: 12

    'Open street map hot': L.tileLayer 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: 'Map by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    'Esri world imagery': L.tileLayer 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Map by Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'

    'Acetate all': L.tileLayer 'http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png',
	   attribution: 'map by Esri & Stamen'
	   subdomains: '0123'
