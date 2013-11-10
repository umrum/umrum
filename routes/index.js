/* global require */

var app = require('../config/app');

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/getting-started', function(req, res) {
    res.render('getting-started.html');
});

app.get('/documentation', function(req, res) {
    res.render('documentation.html');
});

app.get('/support', function(req, res) {
    res.render('support.html');
});

app.get('/terms-of-service', function(req, res) {
    res.render('terms-of-service.html');
});

app.get('/privacy-policy', function(req, res) {
    res.render('privacy-policy.html');
});
