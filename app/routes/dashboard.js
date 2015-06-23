var auth = require('../../config/middlewares/authorization'),
    env = require('../../config/env'),
    path = require('path');

module.exports = function(app){
    app.get('/app.js', auth.redirectAnonymous, function(req, res) {
      if (process.env.PRODUCTION) {
        var rootPublicPath = path.join(__dirname, '../..', env.assetsURL);
        res.sendfile('app.js', {root: rootPublicPath});
      } else {
        res.redirect('//localhost:8080/app.js');
      }
    });

    app.get('/dashboard', auth.redirectAnonymous, function(req, res) {
        res.render('dashboard.html');
    });
};
