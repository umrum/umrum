/* global describe, it, before, after */

var proxyquire = require('proxyquire'),
    assert = require('assert'),
    sinon = require('sinon');

describe('Tests the redisclient module', function(){
    var mockRedis = null,
        fakeRedisClient = null;

    before(function(){
        fakeRedisClient = {
            on: sinon.stub().returnsThis()
        };
        mockRedis = {
            createClient: sinon.stub().returns(fakeRedisClient),
        };
    });

    after(function(){
        mockRedis.createClient.reset();
        fakeRedisClient.on.reset();
    });

    it('check createClient parameters', function(){
        var _redis_port = '123';
        var _redis_host = 'nohost';
        var _redis_opt = {'none': null};

        var configRedis = proxyquire('../config/redisclient', {
            'then-redis': mockRedis,
            './env': {
                REDIS_PORT: _redis_port,
                REDIS_HOST: _redis_host,
                REDIS_OPTIONS: _redis_opt
            }
        });
        configRedis.init();

        assert.ok(mockRedis.createClient.calledOnce);
        var extended_opts = require('util')._extend(_redis_opt, {
            port: _redis_port,
            host: _redis_host
        });
        assert.ok(mockRedis.createClient.calledWithExactly(extended_opts));

        assert.ok(fakeRedisClient.on.calledTwice);
        assert.ok(fakeRedisClient.on.firstCall.args[0], 'connect');
        assert.ok(fakeRedisClient.on.secondCall.args[0], 'error');
    });
});
