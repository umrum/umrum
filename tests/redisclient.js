/* global describe, it, before, after */

var proxyquire = require('proxyquire'),
    assert = require('assert'),
    sinon = require('sinon');

describe('Tests the redisclient module', function(){
    var mockRedis = null,
        fakeRedisClient = null;

    before(function(){
        fakeRedisClient = {
            on: sinon.spy()
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
            redis: mockRedis,
            './env': {
                REDIS_PORT: _redis_port,
                REDIS_HOST: _redis_host,
                REDIS_OPTIONS: _redis_opt
            }
        });
        configRedis.init();

        assert.ok(mockRedis.createClient.calledOnce);
        assert.ok(mockRedis.createClient.calledWithExactly(
            _redis_port, _redis_host, _redis_opt
        ));

        assert.ok(fakeRedisClient.on.calledTwice);
        assert.ok(fakeRedisClient.on.firstCall.args[0], 'connect');
        assert.ok(fakeRedisClient.on.secondCall.args[0], 'error');
    });
});
