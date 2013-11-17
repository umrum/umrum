/* global require */

var app = require('../config/app'),
    api = require('../ext/redis')
;

app.get('/ping', function(req, res) {
    var active_user = {
        'uid': req.query.uid,
        'host': req.query.host,
        'path': req.query.path
    };

    api.registerPageView(active_user);
    setTimeout(function() {
        api.removePageView(active_user);
    }, 10000);

    res.json(active_user);
});
