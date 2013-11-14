/* global require, describe, it, beforeEach, afterEach */

var redisclient = require('../../config/redisclient');
var sinon = require('sinon');

describe('Tests the redis ext module', function(){
    var mockRedisCli = null;

    var _api = function(){
        return require("../../ext/redis");
    };

    beforeEach(function(done){
        mockRedisCli = sinon.mock(redisclient);
        done();
    });

    afterEach(function(done){
        mockRedisCli.restore();
        done();
    });

    describe('#getHosInfo', function(){
        var zrevrangeCallbackArgumentIndex = 7,
            hgetCallbackArgumentIndex = 2,
            host = 'testhost.com',
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
                expectedHostInfo.topPages = [];
                for (var i=0; i<topPages.length; i+=2) {
                    expectedHostInfo.topPages.push([topPages[i], topPages[i+1]]);
                }
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
            topPages = ['/', '5', '/a', '2'];

            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('no results hget', function() {

            mockRedisCli.expects("zrevrangebyscore").never();
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('error in hget', function() {
            err = {error: 'some error'};

            mockRedisCli.expects("zrevrangebyscore").never();
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, err, null)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('no result in zrevrangebyscore', function() {
            currentVisits = '7';

            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('empty result in zrevrangebyscore', function() {
            currentVisits = '7';
            topPages = [];

            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });

        it('error in zrevrangebyscore', function() {
            err = {error: 'some error'};
            currentVisits = '7';

            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(zrevrangeCallbackArgumentIndex, err, null)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(hgetCallbackArgumentIndex, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, _calculate_hostInfo());
        });
    });

    describe('#registerPageView', function(){
        it('unique behavior', function() {
            var active_user = {
                'uid': 'unique user id',
                'host': 'host.com',
                'path': '/path1'
            };

            mockRedisCli.expects('hmset').once().withArgs(
                active_user.uid, active_user
            );
            mockRedisCli.expects('hincrby').once().withArgs(
                active_user.host, 'curr_visits', 1
            );
            mockRedisCli.expects('zincrby').once().withArgs(
                'toppages-'+active_user.host, 1, active_user.path
            );

            _api().registerPageView(active_user);

            mockRedisCli.verify();
        });
    });

    describe('#removePageView', function(){
        it('unique behavior', function() {
            var active_user = {
                'uid': 'unique user id',
                'host': 'host.com',
                'path': '/path1'
            };

            mockRedisCli.expects('del').once().withArgs(active_user.uid);
            mockRedisCli.expects('hincrby').once().withArgs(
                active_user.host, 'curr_visits', -1
            );
            mockRedisCli.expects('zincrby').once().withArgs(
                'toppages-'+active_user.host, -1, active_user.path
            );

            _api().removePageView(active_user);

            mockRedisCli.verify();
        });
    });
});
