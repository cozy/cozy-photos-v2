url = window.location.origin
pathToSocketIO = "#{window.location.pathname.substring(1)}socket.io"
socket = io.connect url, resource: pathToSocketIO

module.exports = socket