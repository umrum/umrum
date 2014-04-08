/* global __dirname */

var path = require('path');

var _env = process.env.NODE_ENV || 'dev',
    _ipaddr = process.env.NODE_IP || '127.0.0.1',
    _port = process.env.NODE_PORT || 8000,
    _mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1/umrum',
    _redisHost = process.env.REDIS_HOST || '127.0.0.1',
    _redisPort = process.env.REDIS_PORT || '6379',
    _redisOptions = {
      'notify-keyspace-events': 'KEx'
    },
    _githubOptions = {
        clientID: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK
    }
;

if ( process.env.OPENSHIFT_SECRET_TOKEN ) {
  _env = 'production';
  _port = process.env.OPENSHIFT_NODEJS_PORT;
  _ipaddr = process.env.OPENSHIFT_NODEJS_IP;
  _redisHost = process.env.OPENSHIFT_REDIS_HOST;
  _redisPort = process.env.OPENSHIFT_REDIS_PORT;
  _redisOptions.auth_pass = process.env.REDIS_PASSWORD;
}

module.exports = {
    env: _env,
    port: _port,
    ipaddr: _ipaddr,
    views: path.normalize(path.join(__dirname, '../views/')),
    assetsPath: path.normalize(path.join(__dirname, '../../assets/')),
    assetsURL: '/assets/',
    minifyOutput: true,
    modelsPath: path.normalize(path.join(__dirname, '../models')),
    controllersPath: path.normalize(path.join(__dirname, '../controllers')),
    github: _githubOptions,
    // external services configs
    MONGO_URI: _mongoUri,
    REDIS_HOST: _redisHost,
    REDIS_PORT: _redisPort,
    REDIS_OPTIONS: _redisOptions
};
