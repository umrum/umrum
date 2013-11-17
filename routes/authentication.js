/* global require */

var app = require('../config/app'),
    passport = require('passport')
;

app.get('/signin', passport.authenticate('github', { scope: 'email' }));
app.get('/signup', passport.authenticate('github', { scope: 'email' }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect : '/error-404' }), function (req, res) {
    res.redirect('/admin-index.html');
});

app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/');
});

