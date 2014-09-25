/* global describe, it, before, afterEach, beforeEach */

var sinon = require('sinon'),
    assert = require('assert'),
    proxyquire = require('proxyquire');

describe('app/ext/redis', function(){
    var configRedis = null,
        mPipeline = null,
        mPubSub = null,
        mRedis = null,
        _redisApi = null;

    before(function(){
        mPipeline = {
            del: sinon.spy(),
            hmset: sinon.spy(),
            setex: sinon.spy(),
            hincrby: sinon.spy(),
            zincrby: sinon.spy(),
            lpush: sinon.spy(),
            ltrim: sinon.spy(),
            exec: sinon.spy()
        };
        mRedis = {
            on: sinon.stub(),
            hget: sinon.stub(),
            multi: sinon.stub().returns(mPipeline),
            hgetall: sinon.stub(),
            lrange: sinon.stub(),
            psubscribe: sinon.stub(),
            zrevrangebyscore: sinon.stub()
        };
        mPubSub = {
            on: sinon.stub(),
            config: sinon.stub(),
            psubscribe: sinon.stub(),
        };

        configRedis = { init: sinon.stub() };
        configRedis.init.onFirstCall().returns(mRedis);
        configRedis.init.onSecondCall().returns(mPubSub);

        _redisApi = proxyquire('../../app/ext/redis', {
            '../../config/redisclient': configRedis
        });
    });

    afterEach(function(){
        [mPipeline, mPubSub, mRedis].forEach(function(mock){
            Object.keys(mock).forEach(function(method){
                if ( mock.hasOwnProperty(method) ) {
                    mock[method].reset();
                }
            });
        });
    });

    it("#__init__", function(){
        // execute
        _redisApi.__init__();

        /* MOCKs verifications */

        assert.ok(mPubSub.config.calledOnce);
        assert.ok(mPubSub.config.calledWithExactly(
            'set', 'notify-keyspace-events', 'KEx'
        ));

        assert.ok(mPubSub.psubscribe.calledOnce);
        assert.ok(mPubSub.psubscribe.calledAfter(mPubSub.config));
        assert.ok(mPubSub.psubscribe.calledWithExactly(
            '__keyevent*__:expired'
        ));
        assert.ok(mPubSub.on.calledOnce);
        assert.ok(mPubSub.on.calledAfter(mPubSub.psubscribe));
        assert.ok(mPubSub.on.calledWith('pmessage'));
    });

    describe('#getHostInfo', function(){
        var zrevrangeCallbackArgumentIndex = 7,
            lrangeCallbackArgumentIndex = 3,
            hgetCallbackArgumentIndex = 2,
            host = 'IDforTesthost.com',
            currentVisits = null,
            serverTime = -1,
            pageLoadTime = -1,
            topPages = null,
            err = null,
            callback = null;

        var _calculate_hostInfo = function(){
            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'serverTime': serverTime,
                'pageLoadTime': pageLoadTime,
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

        beforeEach(function(){
            callback = sinon.spy();
        });

        afterEach(function(){
            currentVisits = null;
            topPages = null;
            err = null;
            serverTime = -1;
            pageLoadTime = -1;
        });

        it('normal behavior', function() {
            var serverTimeList = ['1', '2', '3', '4'],
                pageLoadList = ['10', '20', '30', '40'];

            currentVisits = '7';
            topPages = ['/', '5', '/d', '0', '/a', '2'];
            serverTime = 3; // Math.round(2.5)
            pageLoadTime = 25;

            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, null, currentVisits
            );
            mRedis.zrevrangebyscore.callsArgWith(
                zrevrangeCallbackArgumentIndex, null, topPages
            );
            mRedis.lrange.onFirstCall().callsArgWith(
                lrangeCallbackArgumentIndex, null, serverTimeList
            );
            mRedis.lrange.onSecondCall().callsArgWith(
                lrangeCallbackArgumentIndex, null, pageLoadList
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(mRedis.zrevrangebyscore.calledOnce);
            assert.ok(mRedis.zrevrangebyscore.calledWith(
                'toppages:'+host,
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, 10
            ));

            assert.ok(mRedis.lrange.calledTwice);
            assert.ok(mRedis.lrange.calledWith('servertime:'+host, 0, 49));
            assert.ok(mRedis.lrange.calledWith('pageload:'+host, 0, 49));

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));
        });

        it('no results hget', function() {
            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, null, currentVisits
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(!mRedis.zrevrangebyscore.called);
            assert.ok(!mRedis.lrange.called);

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));
        });

        it('error in hget', function() {
            err = {error: 'some error'};

            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, err, null
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(!mRedis.zrevrangebyscore.called);
            assert.ok(!mRedis.lrange.called);

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));

        });

        it('no result in zrevrangebyscore', function() {
            currentVisits = '7';

            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, null, currentVisits
            );
            mRedis.zrevrangebyscore.callsArgWith(
                zrevrangeCallbackArgumentIndex, null, topPages
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(!mRedis.lrange.called);

            assert.ok(mRedis.zrevrangebyscore.calledOnce);
            assert.ok(mRedis.zrevrangebyscore.calledWith(
                'toppages:'+host,
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, 10
            ));

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));
        });

        it('empty result in zrevrangebyscore', function() {
            var serverTimeList = [],
                pageLoadList = [];

            currentVisits = '7';
            topPages = [];
            serverTime = 0; // Math.round(2.5)
            pageLoadTime = 0;


            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, null, currentVisits
            );
            mRedis.zrevrangebyscore.callsArgWith(
                zrevrangeCallbackArgumentIndex, null, topPages
            );
            mRedis.lrange.onFirstCall().callsArgWith(
                lrangeCallbackArgumentIndex, null, serverTimeList
            );
            mRedis.lrange.onSecondCall().callsArgWith(
                lrangeCallbackArgumentIndex, null, pageLoadList
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(mRedis.lrange.calledTwice);
            assert.ok(mRedis.lrange.calledWith('servertime:'+host, 0, 49));
            assert.ok(mRedis.lrange.calledWith('pageload:'+host, 0, 49));

            assert.ok(mRedis.zrevrangebyscore.calledOnce);
            assert.ok(mRedis.zrevrangebyscore.calledWith(
                'toppages:'+host,
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, 10
            ));

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));
        });

        it('error in zrevrangebyscore', function() {
            err = {error: 'some error'};
            currentVisits = '7';

            /* callbacks excutions */
            mRedis.hget.callsArgWith(
                hgetCallbackArgumentIndex, null, currentVisits
            );
            mRedis.zrevrangebyscore.callsArgWith(
                zrevrangeCallbackArgumentIndex, err, null
            );

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(!mRedis.lrange.called);

            assert.ok(mRedis.zrevrangebyscore.calledOnce);
            assert.ok(mRedis.zrevrangebyscore.calledWith(
                'toppages:'+host,
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, 10
            ));

            assert.ok(callback.calledOnce);
            assert.ok(callback.calledWith(err, _calculate_hostInfo()));
        });
    });

    describe('#registerPageView', function(){
        it('new user', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1',
                'servertime': Math.random()*100,
                'pageload': Math.random()*1000
            };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mPipeline.hincrby.calledOnce);
            assert.ok(mPipeline.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mPipeline.zincrby.calledOnce);
            assert.ok(mPipeline.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mPipeline.lpush.calledTwice);
            assert.ok(mPipeline.lpush.calledWith(
                'servertime:'+active_user.hostId, active_user.servertime
            ));
            assert.ok(mPipeline.lpush.calledWith(
                'pageload:'+active_user.hostId, active_user.pageload
            ));

            assert.ok(mPipeline.ltrim.calledTwice);
            assert.ok(mPipeline.ltrim.calledWith(
                'servertime:'+active_user.hostId, 0, 49
            ));
            assert.ok(mPipeline.ltrim.calledWith(
                'pageload:'+active_user.hostId, 0, 49
            ));

            assert.ok(mPipeline.hmset.calledOnce);
            assert.ok(mPipeline.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mPipeline.setex.calledOnce);
            assert.ok(mPipeline.setex.calledAfter(mPipeline.hmset));
            assert.ok(mPipeline.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mPipeline.exec.calledOnce);
            assert.ok(mPipeline.exec.calledAfter(mPipeline.setex));
        });

        it('new user without servertime', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1',
                'servertime': '',
                'pageload': Math.random()*1000
            };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mPipeline.hincrby.calledOnce);
            assert.ok(mPipeline.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mPipeline.zincrby.calledOnce);
            assert.ok(mPipeline.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mPipeline.lpush.calledOnce);
            assert.ok(mPipeline.lpush.calledWith(
                'pageload:'+active_user.hostId, active_user.pageload
            ));

            assert.ok(mPipeline.ltrim.calledOnce);
            assert.ok(mPipeline.ltrim.calledWith(
                'pageload:'+active_user.hostId, 0, 49
            ));

            assert.ok(mPipeline.hmset.calledOnce);
            assert.ok(mPipeline.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mPipeline.setex.calledOnce);
            assert.ok(mPipeline.setex.calledAfter(mPipeline.hmset));
            assert.ok(mPipeline.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mPipeline.exec.calledOnce);
            assert.ok(mPipeline.exec.calledAfter(mPipeline.setex));
        });

        it('new user without pageload', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1',
                'servertime': Math.random()*1000,
                'pageload': ''
            };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mPipeline.hincrby.calledOnce);
            assert.ok(mPipeline.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mPipeline.zincrby.calledOnce);
            assert.ok(mPipeline.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mPipeline.lpush.calledOnce);
            assert.ok(mPipeline.lpush.calledWith(
                'servertime:'+active_user.hostId, active_user.servertime
            ));

            assert.ok(mPipeline.ltrim.calledOnce);
            assert.ok(mPipeline.ltrim.calledWith(
                'servertime:'+active_user.hostId, 0, 49
            ));

            assert.ok(mPipeline.hmset.calledOnce);
            assert.ok(mPipeline.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mPipeline.setex.calledOnce);
            assert.ok(mPipeline.setex.calledAfter(mPipeline.hmset));
            assert.ok(mPipeline.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mPipeline.exec.calledOnce);
            assert.ok(mPipeline.exec.calledAfter(mPipeline.setex));
        });

        it('old user changed page', function() {
            var active_user = {
                    'uid': 'unique user id',
                    'hostId': 'IDfromHost.com',
                    'url': '/path1'
                },
                old_user = {
                    'uid': 'unique user id',
                    'hostId': 'IDfromHost.com',
                    'url': '/path0'
                };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, old_user);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(!mPipeline.hincrby.called);

            assert.ok(mPipeline.zincrby.calledTwice);
            assert.ok(mPipeline.zincrby.firstCall.args, [
                'toppages:'+active_user.hostId, -1, active_user.url
            ]);
            assert.ok(mPipeline.zincrby.secondCall.args, [
                'toppages:'+active_user.hostId, 1, active_user.url
            ]);

            assert.ok(mPipeline.hmset.calledOnce);
            assert.ok(mPipeline.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mPipeline.setex.calledOnce);
            assert.ok(mPipeline.setex.calledAfter(mPipeline.hmset));
            assert.ok(mPipeline.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mPipeline.exec.calledOnce);
            assert.ok(mPipeline.exec.calledAfter(mPipeline.setex));
        });
    });

    describe('#removePageView', function(){
        it('old_usr is the same of active_usr', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1'
            };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, active_user);

            /* execute method */
            _redisApi.removePageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mPipeline.del.calledOnce);
            assert.ok(mPipeline.del.calledWith(active_user.uid));

            assert.ok(mPipeline.hincrby.calledOnce);
            assert.ok(mPipeline.hincrby.calledWith(
                active_user.hostId, 'curr_visits', -1
            ));

            assert.ok(mPipeline.zincrby.calledOnce);
            assert.ok(mPipeline.zincrby.calledWith(
                'toppages:'+active_user.hostId, -1, active_user.url
            ));

            assert.ok(mPipeline.exec.calledOnce);
            assert.ok(mPipeline.exec.calledAfter(mPipeline.zincrby));
        });

        it('old_usr doesnt exists', function() {
            var active_user = {
                'uid': 'unique user id',
                'hostId': 'IDfromHost.com',
                'url': '/path1'
            };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, null);

            /* execute method */
            _redisApi.removePageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(!mRedis.multi.called);
            assert.ok(!mPipeline.del.called);
            assert.ok(!mPipeline.hincrby.called);
            assert.ok(!mPipeline.zincrby.called);
            assert.ok(!mPipeline.exec.called);
        });

        it('old_usr different URL from active_usr', function() {
            var active_user = {
                    'uid': 'unique user id',
                    'hostId': 'IDfromHost.com',
                    'url': '/path1'
                },
                old_usr = {
                    'uid': 'unique user id',
                    'hostId': 'IDfromHost.com',
                    'url': '/path2'
                };

            /* callbacks excutions */
            mRedis.hgetall.callsArgWith(1, undefined, old_usr);

            /* execute method */
            _redisApi.removePageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(!mRedis.multi.called);
            assert.ok(!mPipeline.del.called);
            assert.ok(!mPipeline.hincrby.called);
            assert.ok(!mPipeline.zincrby.called);
            assert.ok(!mPipeline.exec.called);
        });
    });
});
