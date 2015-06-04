
# Make ajax request more easy to do.
# Expected callbacks: success and error
exports.request = (type, url, data, callbacks) ->

    success = callbacks.success or (res) -> callbacks null, res
    error = callbacks.error or (err) -> callbacks err


    $.ajax
        type: type
        url: url
        data: data
        success: success
        error: error

# Sends a get request with data as body
# Expected callbacks: success and error
exports.get = (url, callbacks) ->
    exports.request "GET", url, null, callbacks

# Sends a post request with data as body
# Expected callbacks: success and error
exports.post = (url, data, callbacks) ->
    exports.request "POST", url, data, callbacks

# Sends a put request with data as body
# Expected callbacks: success and error
exports.put = (url, data, callbacks) ->
    exports.request "PUT", url, data, callbacks

# Sends a delete request with data as body
# Expected callbacks: success and error
exports.del = (url, callbacks) ->
    exports.request "DELETE", url, null, callbacks
