/* global require, module, console */

var env = require('./env');
var redis = require('redis');

var client = redis.createClient(
    env.REDIS_PORT, env.REDIS_HOST, env.REDIS_OPTIONS
);

client.on('connect', function(){
    console.log([
        'Redis successfully connected to: ',
        env.REDIS_HOST,
        ':',
        env.REDIS_PORT
    ].join(''));
    console.log('Redis connection options: ', env.REDIS_OPTIONS);
});

module.exports = client;
