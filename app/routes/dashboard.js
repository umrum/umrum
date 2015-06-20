var api = require('../ext/redis'),
    Site = require('../models/site'),
    auth = require('../../config/middlewares/authorization');

module.exports = function(app){

    app.get('/v1/dashboard/*', auth.redirectAnonymous, function(req, res) {
       res.render('dashboard.html');
    });

    app.get('/app.js', auth.redirectAnonymous, function(req, res) {
      if (process.env.PRODUCTION) {
        res.sendFile(__dirname + '../../build/app.js');
      } else {
        res.redirect('//localhost:8080/app.js');
      }
    });

    app.get('/sites', auth.redirectAnonymous, function(req, res) {
        var buildSitesMap = function(sites) {
          return sites.map(function(e){
              if ( e.host ) { return {host: e.host, code:e._id}; }
          });
        }

        Site.find({creator: req.user.username}, function(err, sites) {
            if (err) {
                console.error(err);
                return res.status(500).render('error.html', {
                    statusCode: 500, statusMessage: err.message
                });
            }
            res.json(buildSitesMap(sites));
        });
    });

    app.get('/dashboard', auth.redirectAnonymous, function(req, res) {
        Site.find({creator: req.user.username}, function(err, sites) {
            if (err) {
                console.error(err);
                return res.status(500).render('error.html', {
                    statusCode: 500, statusMessage: err.message
                });
            }
            res.render('admin-index.html', {
                user: req.user,
                title: req.user.username,
                sites: sites.map(function(e){
                    if ( e.host ) { return {host: e.host, code:e._id}; }
                })
            });
        });
    });

    app.get('/dashboard/:host', auth.redirectAnonymous, function(req, res) {
        Site.findOne({host: req.params.host}, function (err, existent) {
            if (err || !existent) {
                var code = err ? 500 : 404,
                    msg = err ? err.message : 'Host do not exist: ' + req.params.host;
                console[err ? 'error' : 'warn'](err || msg);
                return res.status(code).render('error.html', {
                    statusCode: code, statusMessage: msg
                });
            }
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
            if (err || existent) {
                var msg = err ? err.message : 'Site is already being tracked';
                console[err ? 'error' : 'warn'](err || msg);
                return res.json({code: 500, error: msg});
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
