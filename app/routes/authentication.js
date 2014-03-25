/* global module */

module.exports = function(app, passport){
    app.get('/signin', passport.authenticate('github', { scope: 'email' }));
    app.get('/signup', passport.authenticate('github', { scope: 'email' }));
    app.get(
        '/auth/github/callback',
        passport.authenticate('github', { failureRedirect : '/error-404' }),
        function (req, res) {
            res.redirect('/dashboard');
        }
    );

    app.get('/logout', function (req, res) {
        req.logOut();
        res.redirect('/');
    });
};
