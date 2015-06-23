/* global require, module, console */
var api = require('../ext/redis'),
    Site = require('../models/site'),
    auth = require('../../config/middlewares/authorization');

module.exports = function(app){
    var _endpointPrefix = '/api';

    var defRoute = function(endpoint, handler){
        app.get(_endpointPrefix+endpoint, handler);
    };

    var getActiveUserFromRequest = function(req) {
        var active_user = {
            'uid': req.query.uid,
            'hostId': req.query.hostId,
            'url': req.query.url
        };

        var missing_attr = [];
        for (var key in active_user) {
            if (!active_user[key]) {
                missing_attr.push(key);
            }
        }

        if (missing_attr.length) {
            var err_msg = 'Missing attributes: ' + missing_attr.join(', ');
            console.error(err_msg, active_user, req.query);
            throw new Error(err_msg);
        }

        active_user.pageload = req.query.pageload || '';
        active_user.servertime = req.query.servertime || '';
        return active_user;
    };

    defRoute('/ping', function(req, res) {
        var active_user = getActiveUserFromRequest(req);

        api.registerPageView(active_user);

        var io = require('../../server').io;
        api.getHostInfo(active_user.hostId, function(err, info){
            io.emit(active_user.hostId, info);
        });

        return res.json(active_user);
    });

    defRoute('/disconnect', function(req, res) {
        var active_user = getActiveUserFromRequest(req);

        api.removePageView(active_user);

        var io = require('../../server').io;
        api.getHostInfo(active_user.hostId, function(err, info){
            io.emit(active_user.hostId, info);
        });

        return res.json(active_user);
    });

    app.get('/api/sites', auth.redirectAnonymous, function(req, res) {
        var buildSitesMap = function(sites) {
          return sites.map(function(e){
              if ( e.host ) { return {host: e.host, code:e._id}; }
          });
        };

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

    app.get('/api/dashboard/:host', auth.redirectAnonymous, function(req, res) {
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
                res.json({
                    user: req.user,
                    host: req.params.host,
                    hostId: existent._id,
                    data: info
                });
            });
        });
    });

    app.post('/api/dashboard/create', auth.requiresLogin, function(req, res) {
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
