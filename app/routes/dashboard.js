/* global require, module */

var api = require('../ext/redis');

module.exports = function(app){
    app.get('/dashboard/:host', function(req, res) {
        api.getHostInfo(req.params.host, function(err, info){
          //TODO add error handler
          res.render('admin-index.html', {
            host: req.params.host,
            data: info
          });
        });
    });
};
