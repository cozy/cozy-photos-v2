
# MapReduce's map for "all" request
allMap = (doc) -> emit doc._id, doc

# MapReduce's map for "public" request
publicMap = (doc) ->
    emit doc._id, doc if doc.clearance is 'public'


# MapReduce's map to fetch photos by albumid
byAlbumMap = (photo) -> emit [photo.albumid, photo.title], photo

# MapReduce to fetch thumbs for every album
albumPhotosRequest =
    map: (photo) -> emit photo.albumid, photo._id
    reduce: (key, values, rereduce) -> values[0]

module.exports =
    'album':
        'all': allMap
        'public': publicMap
    'photo':
        'all': allMap
        'byalbum': byAlbumMap
        'albumphotos': albumPhotosRequest
    'contact':
        'all': allMap
    'cozy_instance':
        'all': allMap