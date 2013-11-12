/* global require */

var app = require('../config/app');
var api = require('../ext/redis');

app.get('/dashboard/:host', function(req, res) {
    api.getHostInfo(req.params.host, function(info){
      res.json(info);
    });
});
