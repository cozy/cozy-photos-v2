sharing = require '../helpers/sharing'

module.exports.checkClearance = (permission, type) -> (req, res, next) ->
    sharing.checkClearance element, req, permission, (authorized, rule) ->
        if authorized
            if rule?
                req.guestEmail = rule.email
                req.guestId = rule.contactid
            next()
        else
            err = new Error 'You cannot access this resource'
            err.status = 401
            next err
