/* global require */

var app = require('../config/app');
var api = require('../ext/redis');

app.get('/ping', function(req, res) {
    var uid = req.query.uid;
    var host = req.query.host;
    var path = req.query.path;

    api.registerPageView(uid, host, path);

    // I dont know how acess this expires. Could be a set in redis with
    // redis expires. The code below is just a representation of how
    // expires should works
    if (expires) {
        clearTimeout(expires);
    }

    var expires = setTimeout(function() {
        api.removePageView(host, path);
    })

    res.send([uid, host, path].join(' - '));
});
