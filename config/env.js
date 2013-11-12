/* global require, process, __dirname, module */

var path = require('path'),
    isProduction = (process.env.NODE_ENV === 'production')
;

module.exports = {  //require('config');
    port: (isProduction ? 80 : 8000),
    views: path.normalize(path.join(__dirname, '../app/views/')),
    assetsPath: path.normalize(path.join(__dirname, '../assets/')),
    assetsURL: '/assets/',
    minifyOutput: true,
    MONGO_URI: 'mongodb://ds053858.mongolab.com:53858/umrum',
    modelsPath: path.normalize(path.join(__dirname, '../app/models')),
    controllersPath: path.normalize(path.join(__dirname, '../app/controllers')),
    github: {
        "clientID": "b8a5184274772740060a",
        "clientSecret": "f64d75f0859934c8eb2c80959186e3e705b3d5f1",
        "callbackURL": "http://localhost:8000/auth/github/callback"
    }
};
