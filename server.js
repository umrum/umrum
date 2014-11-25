/* global __dirname */

if (process.env.NODE_ENV === 'production') {
    require('newrelic');
}

var express = require('express'),
    path = require('path'),
    env = require('./config/env'),
    filewalker = require('filewalker'),
    mongoose = require('mongoose'),
    nunjucks = require('nunjucks'),
    renderMinified = require('./config/middlewares/render-minified'),
    passport = require('passport'),
    authConfig = require('./config/authentication')
;

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(env.MONGO_URI, function (err) {
    if ( err ) {
        console.error('ERROR connecting to MongoDB: ' + env.MONGO_URI, err);
        return;
    }
    console.log('MongoDB successfully connected to: ' + env.MONGO_URI);
});

// load mongo models
filewalker(env.modelsPath, {matchRegExp: /.*\.js/i}).on('file', function(file){
    require(path.join(env.modelsPath, file));
}).walk();

var app = express(),
    oneDay = 1 * 24 * 60 * 60 * 1000,
    oneYear = 365 * oneDay;

// used in templates to get assets URLs
app.locals.assetsURL = env.assetsURL;

app.set('views', env.views);

// configure template engine
app.engine('html', nunjucks.render);
nunjucks.configure(env.views, {
    autoescape: true,
    express: app
});

// express compress to render result
var compression = require('compression');
app.use(compression());

// logger config
var morgan = require('morgan');
app.use(morgan({
    format: [
      ':date',
      '(:req[X-Forwarded-For], :remote-addr)',
      ':method | :url | :user-agent',
      ':response-time ms'
    ].join(' - '),
    buffer: 200,
    skip: function(req){
        // skip public/dist files from log
        return (/^\/(dist)|(public)/).test(req.originalUrl);
    }
}));

// app.use(express.favicon());

// parse request parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var cookieParser = require('cookie-parser'),
    session = require('cookie-session'),
    secreKey = 'umrum-secret';

// parse cookies
app.use(cookieParser(secreKey));
// encrypt session
app.use(session({secret: secreKey, maxAge: oneYear, overwrite: true}));

// new response render which passes html-minifier as callback to express render engine
app.use(renderMinified);

// config app session
app.use(passport.initialize());
app.use(passport.session());
authConfig(passport, env);

// static routes
var serveStatic = require('serve-static');
app.use(env.assetsURL, serveStatic(env.assetsPath, { maxAge: oneDay}));
app.use('/dist/', serveStatic(path.join(__dirname, 'dist'), { maxAge: oneDay}));

// app auth route
require('./app/routes/authentication')(app, passport);

// app other routes
['index', 'api', 'dashboard', 'errors'].forEach(function(route){
    require('./app/routes/' + route)(app);
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

module.exports = {
    'app': app,
    'instance': server,
    'io': io
};
