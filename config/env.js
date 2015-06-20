/* global __dirname */

var path = require('path');

var _env = process.env.NODE_ENV || 'dev',
    _ipaddr = process.env.NODE_IP || '127.0.0.1',
    _port = process.env.NODE_PORT || 8000,
    _sessionKey = process.env.UMRUM_SESSION_KEY || 'umrum-secret',
    _mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1/umrum',
    _redisHost = process.env.REDIS_HOST || '127.0.0.1',
    _redisPort = process.env.REDIS_PORT || '6379',
    _redisOptions = {},
    _githubOptions = {
        clientID: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK
    },
    _urlPrefix = process.env.URL_PREFIX || ''
;

var root_dir = path.join(__dirname, '..'),
    app_dir = path.join(root_dir, 'app');

module.exports = {
    env: _env,
    port: _port,
    ipaddr: _ipaddr,
    sessionKey: _sessionKey,
    views: path.join(app_dir, 'views/'),
    assetsPath: path.join(root_dir, 'public/'),
    assetsURL: '/public/',
    minifyOutput: true,
    modelsPath: path.join(app_dir, 'models'),
    controllersPath: path.join(app_dir, 'controllers'),
    github: _githubOptions,
    // external services configs
    MONGO_URI: _mongoUri,
    REDIS_HOST: _redisHost,
    REDIS_PORT: _redisPort,
    REDIS_OPTIONS: _redisOptions,
    URL_PREFIX: _urlPrefix
};
