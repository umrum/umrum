var User = require('../app/models/user'),
    GitHubStrategy = require('passport-github').Strategy
;

module.exports = function(passport, env) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new GitHubStrategy(
        {
            clientID: env.github.clientID,
            clientSecret: env.github.clientSecret,
            callbackURL: env.github.callbackURL
        },
        function(accessToken, refreshtoken, profile, done) {
            var query = User.findOne({
                oauthID: profile.id,
                provider: 'github'
            });
            query.exec( function (err, oldUser) {
                if(oldUser) {
                    done(null, oldUser);
                    return;
                }
                var newUser = new User({
                    oauthID : profile.id,
                    name : profile.displayName,
                    email : profile.emails[0].value,
                    username : profile.username,
                    provider : 'github',
                    created: Date.now(),
                    github : profile._json
                });

                newUser.save(function(err) {
                    if(err) {
                         throw err;
                    }
                    done(null, newUser);
                });
            });
        }
    ));
};
