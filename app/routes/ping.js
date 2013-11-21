/* global require, module */

var api = require('../ext/redis');

module.exports = function(app){
    app.get('/ping', function(req, res) {
        var host = req.query.host;
        var active_user = {
            'uid': req.query.uid,
            'host': host,
            'path': req.query.path
        };

        var server = require('../../server');
        var io = server.io;

        var emitMessage = function() {
            api.getHostInfo(host, function(err, info){
                io.sockets.emit(host, info);
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
