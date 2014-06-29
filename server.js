/* global __dirname */

if (process.env.NODE_ENV === 'production') {
    require('newrelic');
}

var express = require('express'),
    path = require('path'),
    env = require('./app/config/env'),
    filewalker = require('filewalker'),
    mongoose = require('mongoose'),
    nunjucks = require('nunjucks'),
    renderMinified = require('./app/config/middlewares/render-minified'),
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

// load mongo models
filewalker(
    env.modelsPath, {matchRegExp: /.*\.js/i}
).on('file', function(file){
    require(path.join(env.modelsPath, file));
}).walk();

var app = express(),
    oneDay = 1 * 24 * 60 * 60 * 1000;

app.locals.assetsURL = env.assetsURL;

app.set('views', env.views);

// configure template engine
app.engine('html', nunjucks.render);
nunjucks.configure(env.views, {
    autoescape: true,
    express: app
});

// express compress to render result
app.use(express.compress());

app.use(express.logger());
app.use(express.favicon());

// parse request parameters
app.use(express.json());
app.use(express.urlencoded());

// parse cookies
app.use(express.cookieParser());

// encrypt session
app.use(express.session({ secret: 'umrum-ftw' }));

// config app session
app.use(passport.initialize());
app.use(passport.session());
authConfig(passport, env);

// new response render which passes html-minifier as callback to express render engine
app.use(renderMinified);

// static routes
app.use(app.locals.assetsURL, express.static(env.assetsPath, {maxAge: oneDay}));
app.use('/dist/', express.static(path.join(__dirname, 'dist')));

// app auth route
require('./app/routes/authentication')(app, passport);

// app other routes
var routes = ['index', 'api', 'dashboard', 'errors'];
for (var i = routes.length - 1; i >= 0; i--) {
    require('./app/routes/' + routes[i])(app);
}

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

module.exports = {
    'app': app,
    'instance': server,
    'io': io
};
