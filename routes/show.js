/* global require */

var app = require('../config/app');
var api = require('../ext/redis');

app.get('/show/:host', function(req, res) {
    api.getHostInfo(req.params.host, function(info){
      res.render('show.html', {'info': info});
    });
});
