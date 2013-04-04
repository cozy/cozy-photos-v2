operation = (task , callback) ->
    task.photo.doUpload task.file, callback

concurrency = 3

queue = async.queue operation, concurrency

module.exports.process = (file, photo) ->
    console.log 'here'
    queue.push
        file: file
        photo: photo
    , ->