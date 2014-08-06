
# MapReduce's map for "all" request
allMap = (doc) -> emit doc._id, doc

# Order docs by title
byTitleMap = (doc) -> emit doc.title, doc

# MapReduce's map to fetch photos by albumid
byAlbumMap = (photo) -> emit [photo.albumid, photo.title], photo

imageByDate = (doc) ->
    if doc.class is "image"
        emit doc.lastModification, doc

# MapReduce to fetch thumbs for every album
albumPhotosRequest =
    map: (photo) -> emit photo.albumid, [photo._id, photo.orientation]
    reduce: (key, values, rereduce) -> values[0]

module.exports =
    'album':
        'all': allMap
        'byTitle': byTitleMap
    'photo':
        'all': allMap
        'byalbum': byAlbumMap
        'albumphotos': albumPhotosRequest
    'contact':
        'all': allMap
    'cozy_instance':
        'all': allMap
    'file':
        'imageByDate': imageByDate
