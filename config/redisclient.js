/* global require, module */

var redis = require("redis");
var client = redis.createClient();

module.exports = client;
