/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User')
;

/**
 * Authentication callback
 */
module.exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
/**
 * Generic require login routing middleware
 */
module.exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
module.exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

/**
 * Session
 */
module.exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Show sign up form
 */
module.exports.signup = function(req, res) {
    res.render('login/signup.html');
};

/**
 * Show login form
 */
module.exports.signin = function(req, res) {
    res.render('login/signin.html');
};


/**
 * Find user by id
 */
module.exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};
