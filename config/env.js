/* global require, process, __dirname, module */

var path = require('path'),
    _env = 'dev',
    _port = 8000;

if ( process.env.NODE_ENV ) {
  _env = process.env.NODE_ENV;
  _port = process.env.NODE_PORT || (_env === 'production' ? 80 : 8000);
} else if ( process.env.OPENSHIFT_SECRET_TOKEN ) {
  _env = 'production';
  _port = process.env.OPENSHIFT_NODEJS_PORT;
}

module.exports = {  //require('config');
    env: _env,
    port: _port,
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
