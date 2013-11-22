/* global require, process, console, module, __filename */

/**
 *  Creates the express app and configure static folders
 */

var express = require('express'),
    fs = require('fs'),
    env = require('./app/config/env'),
    mongoose = require('mongoose'),
    nunjucks = require('nunjucks'),
    passport = require('passport'),
    authConfig = require('./app/config/authentication')
;

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(env.MONGO_URI, function (err) {
    if ( err ) {
        console.error('ERROR connecting to MongoDB: ' + env.MONGO_URI, err);
        return;
    }
    console.log ('MongoDB successfully connected to: ' + env.MONGO_URI);
});

var autoload = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file,
            stat = fs.statSync(newPath)
        ;
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            autoload(newPath);
        }
    });
};
autoload(env.modelsPath);

var app = express(),
    oneDay = 1 * 24 * 60 * 60 * 1000;

app.use(express.compress());
app.locals.assetsURL = env.assetsURL;
app.set('views', env.views);
app.engine('html', nunjucks.render);
app.use(
    app.locals.assetsURL,
    express.static(env.assetsPath, {
        maxAge: oneDay
    })
);
app.use(express.logger());
app.use(express.favicon());

app.use(passport.initialize());
app.use(passport.session());
authConfig(passport, env);

app.use(app.router);

nunjucks.configure(env.views, {
    autoescape: true,
    express: app
});

var server = app.listen(env.port, env.ipaddr, function(err) {
    if (err) {
        console.error(err);
        process.exit(-1);
    }

    // if run as root, downgrade to the owner of this file
    if (process.platform.toLowerCase().indexOf('win') === -1) {
        if ( process.getuid() === 0 ) {
            fs.stat(__filename, function(err, stats) {
                if (err) {
                    return console.error(err);
                }
                process.setuid(stats.uid);
            });
        }
    }
    console.log('%s: Node server started on http://%s:%d ...',
                Date(Date.now() ), env.ipaddr, env.port);
});

require('./app/routes/authentication')(app, passport);

var routes = ['index', 'ping', 'dashboard', 'errors'];
for (var i = routes.length - 1; i >= 0; i--) {
    require('./app/routes/' + routes[i])(app);
}

module.exports = {
    'app': app,
    'instance': server
};
