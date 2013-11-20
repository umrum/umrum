/* global require, module, console */

module.exports.init = function(){
    var env = require('../config/env');

    var client = require('redis').createClient(
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
    return client;
};
