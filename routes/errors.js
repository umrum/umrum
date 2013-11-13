/* global require */

var app = require('../config/app');

app.use(function(req, res) {
    res.status(404);
    res.render('404.html');
});
