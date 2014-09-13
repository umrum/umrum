module.exports.init = function(){
    var env = require('./env');

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

    client.on('error', function(err) {
        console.error('Error in redis connection', err);
    });

    return client;
};
