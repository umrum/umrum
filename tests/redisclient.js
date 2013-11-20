/* global require, describe, it, before, after */

var env = require('../app/config/env');
var redis = require('redis');
var sinon = require('sinon');

describe('Tests the redisclient module', function(){
    var mockRedis = null;

    before(function(done){
        mockRedis = sinon.mock(redis);
        done();
    });

    after(function(done){
        mockRedis.restore();
        done();
    });

    it('check createClient parameters', function(){
        var _redisCreatedClient = { on: function(){} };
        var _redis_port = '123';
        var _redis_host = 'nohost';
        var _redis_opt = {'none': null};
        env.REDIS_PORT = _redis_port;
        env.REDIS_HOST = _redis_host;
        env.REDIS_OPTIONS = _redis_opt;

        mockRedis
            .expects("createClient")
                .once()
                .withExactArgs(_redis_port, _redis_host, _redis_opt)
                .returns(_redisCreatedClient)
        ;

        var _mock_fake_client = sinon.mock(_redisCreatedClient);
        _mock_fake_client.expects('on').once();

        require('../app/config/redisclient').init();

        mockRedis.verify();
        _mock_fake_client.verify();
    });
});
