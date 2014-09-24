var api = require('../ext/redis'),
    Site = require('../models/site'),
    auth = require('../../config/middlewares/authorization');

module.exports = function(app){
    app.get('/dashboard', auth.redirectAnonymous, function(req, res) {
        Site.find({creator: req.user.username}, function(err, docs) {
            if ( err ) { throw err; }
            res.render('admin-index.html', {
                user: req.user,
                title: req.user.username,
                sites: docs.map(function(e){
                    if ( e.host ) { return {host: e.host, code:e._id}; }
                })
            });
        });
    });

    app.get('/dashboard/:host', auth.redirectAnonymous, function(req, res) {
        Site.findOne({host: req.params.host}, function (err, existent) {
            api.getHostInfo(existent._id, function(err, info){
                //TODO add error handler
                res.render('admin-view.html', {
                    user: req.user,
                    host: req.params.host,
                    hostId: existent._id,
                    data: info
                });
            });
        });
    });

    app.post('/dashboard/create', auth.requiresLogin, function(req, res) {
        Site.findOne({host: req.body.host}, function (err, existent) {
            if(existent) {
                res.json({code: 500, error: 'Site is already being tracked'});
                return;
            }

            var host = req.body.host;
            new Site({
                host: host,
                creator: req.user.username,
                created: Date.now()
            }).save(function(err, site){
                if ( err ) {
                    res.json({code: 500, error: err});
                    return;
                }
                res.json({
                  code: 200,
                  site: {
                    code: site._id,
                    host: host
                  }
                });
            });
        });
    });
};
