/* global require, process, __dirname, module */

var path = require('path');

var _env = process.env.NODE_ENV || 'dev',
    _ipaddr = process.env.NODE_IP || '127.0.0.1',
    _port = process.env.NODE_PORT || 8000,
    _mongo_uri = process.env.MONGO_URI || 'mongodb://localhost/umrum'
;

if ( process.env.OPENSHIFT_SECRET_TOKEN ) {
  _env = 'production';
  _port = process.env.OPENSHIFT_NODEJS_PORT;
  _ipaddr = process.env.OPENSHIFT_NODEJS_IP;
}

if ( _env === 'production' ) {
    _mongo_uri = 'mongodb://umrum:UmR*m1pp@ds053858.mongolab.com:53858/umrum';
}

module.exports = {  //require('config');
    env: _env,
    port: _port,
    ipaddr: _ipaddr,
    views: path.normalize(path.join(__dirname, '../views/')),
    assetsPath: path.normalize(path.join(__dirname, '../../assets/')),
    assetsURL: '/assets/',
    minifyOutput: true,
    MONGO_URI: _mongo_uri,
    modelsPath: path.normalize(path.join(__dirname, '../models')),
    controllersPath: path.normalize(path.join(__dirname, '../controllers')),
    github: {
        "clientID": "b8a5184274772740060a",
        "clientSecret": "f64d75f0859934c8eb2c80959186e3e705b3d5f1",
        "callbackURL": "http://localhost:8000/auth/github/callback"
    }
};
