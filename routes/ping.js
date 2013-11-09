/* global require */

var app = require('../config/app');

app.get('/ping', function(req, res) {
    res.send();
});
