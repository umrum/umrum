/* global describe, it, before, afterEach, beforeEach */

var sinon = require('sinon'),
    assert = require('assert'),
    proxyquire = require('proxyquire');

describe('app/ext/redis', function(){
    var configRedis = null,
        mPubSub = null,
        mRedis = null,
        _redisApi = null;

    var stub_returnsPromise = function(){
        var m = sinon.stub();
        m._ret_ = { then: sinon.stub(), catch: sinon.stub() };
        m.returns(m._ret_);
        return m;
    };

    before(function(){
        mRedis = {
            hget: stub_returnsPromise(),
            multi: stub_returnsPromise(),
            hgetall: stub_returnsPromise(),
            lrange: stub_returnsPromise(),
            zrevrangebyscore: stub_returnsPromise(),
            del: sinon.spy(),
            hmset: sinon.spy(),
            setex: sinon.spy(),
            hincrby: sinon.spy(),
            zincrby: sinon.spy(),
            lpush: sinon.spy(),
            ltrim: sinon.spy(),
            exec: stub_returnsPromise()
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
        [mPubSub, mRedis].forEach(function(mock){
            Object.keys(mock).forEach(function(method){
                if ( mock.hasOwnProperty(method) ) {
                    if ( mock[method]._ret_ ) {
                        mock[method] = stub_returnsPromise();
                    } else {
                        mock[method].reset();
                    }
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
        var host = 'IDforTesthost.com',
            callback = null,
            currentVisits,
            topPages,
            err,
            serverTime,
            pageLoadTime;

        var sanitizeVariables = function(){
                currentVisits = null;
                topPages = null;
                err = undefined;
                serverTime = -1;
                pageLoadTime = -1;
            };
        var _calculate_hostInfo = function(){
            return {
                'currentVisits': currentVisits,
                'serverTime': serverTime,
                'pageLoadTime': pageLoadTime,
                'topPages': !topPages ? null : topPages.map(function(item, i, arr){
                    return ( i%2 ) ? null : {
                      url: item,
                      counter: parseInt(arr[i+1], 10)
                    };
                }).filter(function(item){
                    return item && item.counter;
                })
            };
        };

        beforeEach(function(){
            callback = sinon.spy();
            sanitizeVariables();

            /* normal promises excutions */
            mRedis.hget._ret_.then.returns(mRedis.zrevrangebyscore._ret_);
            mRedis.zrevrangebyscore._ret_.then.returns(mRedis.lrange._ret_);
            mRedis.lrange._ret_.then.returnsThis();
        });

        it('assert method flow', function() {
            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */
            assert.ok(mRedis.hget.calledOnce);
            assert.ok(mRedis.hget.calledWith(host, 'curr_visits'));

            assert.ok(!mRedis.zrevrangebyscore.calledOnce);
            assert.ok(!mRedis.lrange.calledOnce);
            assert.ok(!callback.calledOnce);

            assert.ok(mRedis.hget._ret_.then.calledOnce);
            assert.ok(mRedis.zrevrangebyscore._ret_.then.calledOnce);
            assert.ok(mRedis.lrange._ret_.then.calledTwice);
            assert.ok(mRedis.lrange._ret_.catch.calledOnce);
        });

        it('normal behavior', function() {
            var serverTimeList = ['1', '2', '3', '4'],
                pageLoadList = ['10', '20', '30', '40'];

            currentVisits = '7';
            topPages = ['/', '5', '/d', '0', '/a', '2'];
            serverTime = 3; // Math.round(2.5)
            pageLoadTime = 25;

            /* promises excutions */
            mRedis.hget._ret_.then.callsArgWith(0, currentVisits);
            mRedis.zrevrangebyscore._ret_.then.callsArgWith(0, topPages);
            mRedis.lrange._ret_.then.onFirstCall()
                .callsArgWith(0, serverTimeList).returnsThis();
            mRedis.lrange._ret_.then.onSecondCall()
                .callsArgWith(0, pageLoadList).returnsThis();

            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */

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
            assert.ok(callback.calledWithMatch(err, _calculate_hostInfo()));
        });

        it('hget no-results threw', function() {
            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */
            assert.ok(!mRedis.zrevrangebyscore.called);
            assert.ok(!mRedis.lrange.called);
            assert.throws(function() {
                mRedis.hget._ret_.then.callArgWith(0, currentVisits);
            }, function(err) {
                return (err instanceof Error) && /No visitors/.test(err);
            }, "unexpected error");
        });

        it('zrevrangebyscore no-result do not threw', function() {
            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */
            assert.doesNotThrow(function() {
                mRedis.zrevrangebyscore._ret_.then.callArgWith(0, null);
            });

            assert.ok(mRedis.lrange.calledOnce);
            assert.ok(mRedis.lrange.calledWith('servertime:'+host, 0, 49));
        });

        it('zrevrangebyscore empty array ', function() {
            /* execute method */
            _redisApi.getHostInfo(host, callback);

            /* MOCKs verifications */
            assert.doesNotThrow(function() {
                mRedis.zrevrangebyscore._ret_.then.callArgWith(0, []);
            });

            assert.ok(mRedis.lrange.calledOnce);
            assert.ok(mRedis.lrange.calledWith('servertime:'+host, 0, 49));
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
            mRedis.hgetall._ret_.then.callsArgWith(0, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mRedis.hincrby.calledOnce);
            assert.ok(mRedis.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mRedis.zincrby.calledOnce);
            assert.ok(mRedis.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mRedis.lpush.calledTwice);
            assert.ok(mRedis.lpush.calledWith(
                'servertime:'+active_user.hostId, active_user.servertime
            ));
            assert.ok(mRedis.lpush.calledWith(
                'pageload:'+active_user.hostId, active_user.pageload
            ));

            assert.ok(mRedis.ltrim.calledTwice);
            assert.ok(mRedis.ltrim.calledWith(
                'servertime:'+active_user.hostId, 0, 49
            ));
            assert.ok(mRedis.ltrim.calledWith(
                'pageload:'+active_user.hostId, 0, 49
            ));

            assert.ok(mRedis.hmset.calledOnce);
            assert.ok(mRedis.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mRedis.setex.calledOnce);
            assert.ok(mRedis.setex.calledAfter(mRedis.hmset));
            assert.ok(mRedis.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mRedis.exec.calledOnce);
            assert.ok(mRedis.exec.calledAfter(mRedis.setex));
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
            mRedis.hgetall._ret_.then.callsArgWith(0, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mRedis.hincrby.calledOnce);
            assert.ok(mRedis.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mRedis.zincrby.calledOnce);
            assert.ok(mRedis.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mRedis.lpush.calledOnce);
            assert.ok(mRedis.lpush.calledWith(
                'pageload:'+active_user.hostId, active_user.pageload
            ));

            assert.ok(mRedis.ltrim.calledOnce);
            assert.ok(mRedis.ltrim.calledWith(
                'pageload:'+active_user.hostId, 0, 49
            ));

            assert.ok(mRedis.hmset.calledOnce);
            assert.ok(mRedis.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mRedis.setex.calledOnce);
            assert.ok(mRedis.setex.calledAfter(mRedis.hmset));
            assert.ok(mRedis.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mRedis.exec.calledOnce);
            assert.ok(mRedis.exec.calledAfter(mRedis.setex));
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
            mRedis.hgetall._ret_.then.callsArgWith(0, null);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mRedis.hincrby.calledOnce);
            assert.ok(mRedis.hincrby.calledWith(
                active_user.hostId, 'curr_visits', 1
            ));

            assert.ok(mRedis.zincrby.calledOnce);
            assert.ok(mRedis.zincrby.calledWith(
                'toppages:'+active_user.hostId, 1, active_user.url
            ));

            assert.ok(mRedis.lpush.calledOnce);
            assert.ok(mRedis.lpush.calledWith(
                'servertime:'+active_user.hostId, active_user.servertime
            ));

            assert.ok(mRedis.ltrim.calledOnce);
            assert.ok(mRedis.ltrim.calledWith(
                'servertime:'+active_user.hostId, 0, 49
            ));

            assert.ok(mRedis.hmset.calledOnce);
            assert.ok(mRedis.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mRedis.setex.calledOnce);
            assert.ok(mRedis.setex.calledAfter(mRedis.hmset));
            assert.ok(mRedis.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mRedis.exec.calledOnce);
            assert.ok(mRedis.exec.calledAfter(mRedis.setex));
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
            mRedis.hgetall._ret_.then.callsArgWith(0, old_user);

            /* execute method */
            _redisApi.registerPageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(!mRedis.hincrby.called);

            assert.ok(mRedis.zincrby.calledTwice);
            assert.ok(mRedis.zincrby.firstCall.args, [
                'toppages:'+active_user.hostId, -1, active_user.url
            ]);
            assert.ok(mRedis.zincrby.secondCall.args, [
                'toppages:'+active_user.hostId, 1, active_user.url
            ]);

            assert.ok(mRedis.hmset.calledOnce);
            assert.ok(mRedis.hmset.calledWith(
                active_user.uid, active_user
            ));

            assert.ok(mRedis.setex.calledOnce);
            assert.ok(mRedis.setex.calledAfter(mRedis.hmset));
            assert.ok(mRedis.setex.calledWith(
                'expusr-'+active_user.uid, 300, 1
            ));

            assert.ok(mRedis.exec.calledOnce);
            assert.ok(mRedis.exec.calledAfter(mRedis.setex));
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
            mRedis.hgetall._ret_.then.callsArgWith(0, active_user);

            /* execute method */
            _redisApi.removePageView(active_user);

            /* MOCKs verifications */

            assert.ok(mRedis.hgetall.calledOnce);
            assert.ok(mRedis.hgetall.calledWith(active_user.uid));

            assert.ok(mRedis.multi.calledOnce);

            assert.ok(mRedis.del.calledOnce);
            assert.ok(mRedis.del.calledWith(active_user.uid));

            assert.ok(mRedis.hincrby.calledOnce);
            assert.ok(mRedis.hincrby.calledWith(
                active_user.hostId, 'curr_visits', -1
            ));

            assert.ok(mRedis.zincrby.calledOnce);
            assert.ok(mRedis.zincrby.calledWith(
                'toppages:'+active_user.hostId, -1, active_user.url
            ));

            assert.ok(mRedis.exec.calledOnce);
            assert.ok(mRedis.exec.calledAfter(mRedis.zincrby));
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
            assert.ok(!mRedis.del.called);
            assert.ok(!mRedis.hincrby.called);
            assert.ok(!mRedis.zincrby.called);
            assert.ok(!mRedis.exec.called);
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
            assert.ok(!mRedis.del.called);
            assert.ok(!mRedis.hincrby.called);
            assert.ok(!mRedis.zincrby.called);
            assert.ok(!mRedis.exec.called);
        });
    });
});
