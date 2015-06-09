'use strict';

var env = require('./env'),
    opts = require('util')._extend(env.REDIS_OPTIONS, {
        port: env.REDIS_PORT,
        host: env.REDIS_HOST
    });

module.exports = {
    init: (name) => {
        let client = require('then-redis').createClient(opts);
        client
            .on('connect', () => console.log('redis-cli[%s] ON: ', name, opts))
            .on('error', console.error);
        return client;
    }
};
