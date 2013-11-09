/* global require */

var app = require('../config/app');

app.get('/', function(req, res) {
    res.render('index.html');
});
