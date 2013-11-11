/* global require */

var app = require('../config/app');
var api = require('../ext/redis');

app.get('/ping', function(req, res) {
    var uid = req.query.uid;
    var host = req.query.host;
    var path = req.query.path;

    api.registerPageView(uid, host, path);

    setTimeout(function() {
        api.removePageView(host, path);
    });

    res.send([uid, host, path].join(' - '));
});
