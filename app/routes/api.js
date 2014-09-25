/* global require, module, console */
var api = require('../ext/redis');

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
            io.sockets.emit(active_user.hostId, info);
        });

        return res.json(active_user);
    });

    defRoute('/disconnect', function(req, res) {
        var active_user = getActiveUserFromRequest(req);

        api.removePageView(active_user);

        var io = require('../../server').io;
        api.getHostInfo(active_user.hostId, function(err, info){
            io.sockets.emit(active_user.hostId, info);
        });

        return res.json(active_user);
    });
};
