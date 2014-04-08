/* global describe, it, beforeEach, afterEach, before, after */

var redisclient = require('../../app/config/redisclient');
var sinon = require('sinon');

describe('Tests the redis ext module', function(){
    var _redisApi = null,
        _redisInit = null,
        _fake_redis = {
            on: function(){},
            del: function(){},
            hget: function(){},
            hlen: function(){},
            hmset: function(){},
            setex: function(){},
            hincrby: function(){},
            zincrby: function(){},
            psubscribe: function(){},
            zrevrangebyscore: function(){}
        },
        mockRedis = null
    ;

    before(function(done){
        _redisInit = sinon.stub(redisclient, 'init');
        _redisInit.returns(_fake_redis);
        _redisApi = require("../../app/ext/redis");
        done();
    });

    after(function(done){
        _redisInit.restore();
        done();
    });

    beforeEach(function(done){
        mockRedis = sinon.mock(_fake_redis);
        done();
    });

    afterEach(function(done){
        mockRedis.restore();
        done();
    });

    describe('#getHosInfo', function(){
        var zrevrangeCallbackArgumentIndex = 7,
            hgetCallbackArgumentIndex = 2,
            host = 'IDforTesthost.com',
            currentVisits = null,
            topPages = null,
            err = null,
            callback = null;

        var _calculate_hostInfo = function(){
            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'topPages': null
            };
            if ( topPages ) {
                expectedHostInfo.topPages = topPages.map(function(item, idx, arr){
                    if (idx%2) {
                        return null;
                    }
                    return [item, parseInt(arr[idx+1], 10)];
                }).filter(function(item){
                    return item && item[1];
                });
            }
            return expectedHostInfo;
        };

        beforeEach(function(done){
            callback = sinon.mock();
            done();
        });

        afterEach(function(done){
            currentVisits = null;
            topPages = null;
            err = null;
            done();
        });

        it('normal behavior', function() {
            currentVisits = '7';
            topPages = ['/', '5', '/d', '0', '/a', '2'];

            mockRedis
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages:'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('no results hget', function() {

            mockRedis.expects("zrevrangebyscore").never();
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('error in hget', function() {
            err = {error: 'some error'};

            mockRedis.expects("zrevrangebyscore").never();
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, err, null)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('no result in zrevrangebyscore', function() {
            currentVisits = '7';

            mockRedis
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages:'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('empty result in zrevrangebyscore', function() {
            currentVisits = '7';
            topPages = [];

            mockRedis
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages:'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('error in zrevrangebyscore', function() {
            err = {error: 'some error'};
            currentVisits = '7';

            mockRedis
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages:'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, err, null)
            ;
            mockRedis
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _redisApi.getHostInfo(host, callback);

            mockRedis.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });
    });

    describe('#registerPageView', function(){
        it('unique behavior', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1'
            };

            mockRedis
                .expects('hlen')
                    .once()
                    .withArgs(active_user.uid)
                    .callsArgWith(1, 0);

            mockRedis.expects('setex').once().withArgs(
                'expusr-'+active_user.uid, 10, 1
            );

            mockRedis.expects('hmset').once().withArgs(
                active_user.uid, active_user
            );
            mockRedis.expects('hincrby').once().withArgs(
                active_user.hostId, 'curr_visits', 1
            );
            mockRedis.expects('zincrby').once().withArgs(
                'toppages:'+active_user.hostId, 1, active_user.url
            );

            _redisApi.registerPageView(active_user);

            mockRedis.verify();
        });
    });

    describe('#removePageView', function(){
        it('unique behavior', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1'
            };

            mockRedis.expects('del').once().withArgs(active_user.uid);
            mockRedis.expects('hincrby').once().withArgs(
                active_user.hostId, 'curr_visits', -1
            );
            mockRedis.expects('zincrby').once().withArgs(
                'toppages:'+active_user.hostId, -1, active_user.url
            );

            _redisApi.removePageView(active_user);

            mockRedis.verify();
        });
    });
});
