/* global require */

var app = require('../config/app');
var redis = require('../ext/redis');

app.get('/show/:host', function(req, res) {
    var info = redis.getHostInfo(host);
    res.render('show.html', info=info);
});
