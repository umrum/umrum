module.exports.init = function(name){
    if ( !name ) {
        name = 'default:' + parseInt(Math.random()*1000);
    }

    var env = require('./env'),
        _extend = require('util')._extend,
        opts = _extend(env.REDIS_OPTIONS, {
            port: env.REDIS_PORT,
            host: env.REDIS_HOST
        });

    var client = require('then-redis').createClient(opts);
    client
    .on('connect', function(){
        console.log('redis-cli[%s] connected with options: ', name, opts);
    })
    .on('error', console.error);

    return client;
};
