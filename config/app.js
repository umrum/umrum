/* global require, process, console, module, __filename */

/**
 *  Creates the express app and configure static folders
 */

var express = require('express'),
    fs = require('fs'),
    env = require('./env'),
    mongoose = require('mongoose'),
    redis = require('./redisclient'),
    nunjucks = require('nunjucks')
;

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
var connection = env.MONGO_URI || 'mongodb://localhost/umrum';
mongoose.connect(connection, function (err) {
    console.log ( err ? 'ERROR connecting to: ' + env.MONGO_URI + '. ' + err : 'Succeeded connected to: ' + env.MONGO_URI );
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
    oneDay = 86400000;

app.use(express.compress(), {
    maxAge: oneDay
});
app.locals.assetsURL = env.assetsURL;
app.set('views', env.views);
app.set('redis', redis);
app.engine('html', nunjucks.render);
app.use(app.locals.assetsURL, express.static(env.assetsPath));
app.use(express.logger());
app.use(app.router);

nunjucks.configure(env.views, {
    autoescape: true,
    express: app
});

app.listen(env.port, env.ipaddr, function(err) {
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
    console.log('%s: Node server started on http://0.0.0.0:%d ...',
                Date(Date.now() ), env.port);
});

module.exports = app;
