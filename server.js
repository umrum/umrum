/* global __dirname */

/**
 *  Creates the express app and configure static folders
 */

require('newrelic');

var express = require('express'),
    path = require('path'),
    env = require('./app/config/env'),
    filewalker = require('filewalker'),
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

filewalker(
    env.modelsPath, {matchRegExp: /.*\.js/i}
).on('file', function(file){
    require(path.join(env.modelsPath, file));
}).walk();

var app = express(),
    oneDay = 1 * 24 * 60 * 60 * 1000;

app.use(express.compress());
app.set('views', env.views);
app.engine('html', nunjucks.render);

app.locals.assetsURL = env.assetsURL;
app.use(
    app.locals.assetsURL,
    express.static(env.assetsPath, {
        maxAge: oneDay
    })
);

app.use(
    '/dist/',
    express.static(path.normalize(path.join(__dirname, 'dist/')))
);

app.use(express.json());
app.use(express.urlencoded());

app.use(express.logger());
app.use(express.favicon());

app.use(express.cookieParser());
app.use(express.session({ secret: 'umrum-ftw' }));

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

    console.log(
        '%s: Node server started on http://%s:%d ...',
        new Date(),
        env.ipaddr,
        env.port
    );
});

var io = require('socket.io').listen(server);
io.set('log level', 2);

require('./app/routes/authentication')(app, passport);

var routes = ['index', 'ping', 'dashboard', 'errors'];
for (var i = routes.length - 1; i >= 0; i--) {
    require('./app/routes/' + routes[i])(app);
}

module.exports = {
    'app': app,
    'instance': server,
    'io': io
};
