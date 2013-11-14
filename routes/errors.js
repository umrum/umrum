/* global require */

var app = require('../config/app');

app.use(function(req, res) {
    res.status(404);
    res.render('error.html', {
        statusCode: 404,
        statusMessage: 'Page not found'
    });
});
