/* global require */

var app = require('../config/app'),
    passport = require('passport'),
    auth = require('../config/middlewares/authorization'),
    index = require('../app/controllers/index'),
    user = require('../app/controllers/user')
;

app.get('/', index.index );
app.get('/getting-started', index.gettingStarted);
app.get('/documentation', index.documentation);
app.get('/support', index.support);
app.get('/terms-of-service', index.termsOfService);
app.get('/privacy-policy', index.privacyPolicy);

app.get('/signin', user.signin);

//Setting the github oauth routes
app.get('/signup', passport.authenticate('github', {
    failureRedirect: '/signin'
}), user.signin);

app.get('auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
}), user.authCallback);
