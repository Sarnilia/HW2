const { sessions } = require('../../sessions')

const checkAuth = (req, res, next) => {
    const sidFromUser = req.cookies.sid

    if (sessions[sidFromUser]) {
        return next()
    }

    res.redirect('/auth/signin')
}

module.exports = {
    checkAuth,
}