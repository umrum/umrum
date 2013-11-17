/* global require, process, __dirname, module */

var path = require('path');

var _env = process.env.NODE_ENV || 'dev';
var _ipaddr = process.env.NODE_IP || '127.0.0.1';
var _port = process.env.NODE_PORT || 8000;

if ( process.env.OPENSHIFT_SECRET_TOKEN ) {
  _env = 'production';
  _port = process.env.OPENSHIFT_NODEJS_PORT;
  _ipaddr = process.env.OPENSHIFT_NODEJS_IP;
}

module.exports = {  //require('config');
    env: _env,
    port: _port,
    ipaddr: _ipaddr,
    views: path.normalize(path.join(__dirname, '../app/views/')),
    assetsPath: path.normalize(path.join(__dirname, '../assets/')),
    assetsURL: '/assets/',
    minifyOutput: true,
    MONGO_URI: 'mongodb://umrum:UmR*m1pp@ds053858.mongolab.com:53858/umrum',
    modelsPath: path.normalize(path.join(__dirname, '../app/models')),
    controllersPath: path.normalize(path.join(__dirname, '../app/controllers')),
    github: {
        "clientID": "b8a5184274772740060a",
        "clientSecret": "f64d75f0859934c8eb2c80959186e3e705b3d5f1",
        "callbackURL": "http://localhost:8000/auth/github/callback"
    }
};
