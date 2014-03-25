/* global require, module */

var api = require('../ext/redis'),
    Site = require('../models/site');

module.exports = function(app){
    app.get('/dashboard', function(req, res) {
        if ( !req.isAuthenticated() ) {
            res.redirect('/signin');
        } else {
            Site.find({creator: req.user.username}, function(err, docs) {
                if ( err ) throw err;
                docs = docs.map(function(e){ return e.host; });
                res.render('admin-index.html', {
                    user: req.user,
                    title: req.user.username,
                    sites: docs
                });
            });
        }

    });

    app.get('/dashboard/:host', function(req, res) {
        if ( !req.isAuthenticated() ) {
            res.redirect('/signin');
        } else {
            api.getHostInfo(req.params.host, function(err, info){
                //TODO add error handler
                res.render('admin-view.html', {
                    user: req.user,
                    title: req.params.host,
                    data: info
                });
            });
        }
    });

};
