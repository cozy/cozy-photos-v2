# Add Helpers to send error or success responses to jquery UI in a prettier way.
module.exports = (req, res, next) ->

    res.error = (code, msg, err) ->
        console.log msg
        if err
            console.log err
            console.log err.stack
        res.status(code).send error:msg
        return msg

    res.success = (msg) ->
        res.send success:msg

    next()
