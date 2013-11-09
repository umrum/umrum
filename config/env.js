/* global require, process, __dirname, module */

var path = require('path');
var isProduction = (process.env.NODE_ENV === 'production');

module.exports = {  //require('config');
    port: (isProduction ? 80 : 8000),
    views: path.normalize(path.join(__dirname, '../views/')),
    assetsPath: path.normalize(path.join(__dirname, '../assets/')),
    assetsURL: '/assets/',
};
