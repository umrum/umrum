/* global require, module */

var api = require('../ext/redis');

module.exports = function(app){
    app.get('/ping', function(req, res) {
        var hostId = req.query.hostId;
        var active_user = {
            'uid': req.query.uid,
            'hostId': hostId,
            'url': req.query.url
        };
        console.log('/ping', active_user, req.query);

        var server = require('../../server');
        var io = server.io;

        var emitMessage = function() {
            api.getHostInfo(hostId, function(err, info){
                io.sockets.emit(hostId, info);
            });
        };

        api.registerPageView(active_user);

        setTimeout(function() {
            api.removePageView(active_user);
        }, 10000);

        emitMessage();
        res.json(active_user);
    });
};
