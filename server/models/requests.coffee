# lint
emit = null

# MapReduce's map for "all" request
allMap = (doc) -> emit doc._id, doc

# Order docs by title
byTitleMap = (doc) -> emit doc.title, doc

# MapReduce's map to fetch photos by albumid
byAlbumMap = (photo) -> emit [photo.albumid, photo.title], photo

imageByDate = (doc) ->
    if doc.class is "image" and doc.binary?.file?
        emit doc.lastModification, doc

withoutThumb = (doc) ->
    if doc.class is "image" and doc.binary?.file? and (not doc.binary.thumb?)
        emit doc._id, doc

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
    'file':
        'imageByDate': imageByDate
        'withoutThumb': withoutThumb
