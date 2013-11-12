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
    models_path: path.normalize(path.join(__dirname, '../app/models')),
    controllers_path: path.normalize(path.join(__dirname, '../app/controllers')),
    facebook: {
        "clientID": "160994660777467",
        "clientSecret": "8061f2ce997c225bef14e45ad37027ff",
        "callbackURL": "http://localhost:8000/auth/facebook/callback"
    },
    github: {
        "clientID": "b8a5184274772740060a",
        "clientSecret": "f64d75f0859934c8eb2c80959186e3e705b3d5f1",
        "callbackURL": "http://localhost:8000/auth/github/callback"
    }
};
