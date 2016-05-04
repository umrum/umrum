var auth = require('../../config/middlewares/authorization'),
    _extend = require('util')._extend,
    env = require('../../config/env'),
    path = require('path'),
    http = require('http'),
    url = require('url');

var webpackAppURL = { host: env.WEBPACK_HOST, port: env.WEBPACK_PORT, pathname: 'app.js' };
console.log(webpackAppURL);
module.exports = function(app){
  app.get('/app.js', auth.redirectAnonymous, function(req, res) {
    if (env.env === 'production') {
      var rootPublicPath = path.join(__dirname, '..', '..', env.assetsURL);
      res.sendfile('app.js', {root: rootPublicPath});
    } else {
      var webpackAppLocation = url.format(_extend(webpackAppURL, {
        protocol: req.protocol
      }));
      console.log(webpackAppLocation);
      http.request(webpackAppLocation, function(webpackRes) {
        webpackRes.pipe(res);
      }).end();
    }
  });

  app.get('/dashboard', auth.redirectAnonymous, function(req, res) {
    res.render('dashboard.html');
  });
};
