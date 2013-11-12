/* global require, describe, it */

var redisclient = require('../../config/redisclient');
var sinon = require('sinon');

describe('Tests the redis ext module', function(){

    var _api = function(){
        return require("../../ext/redis");
    };

    describe('#getHosInfo', function(){
        it('normal behavior', function() {
            var host = 'testhost.com',
                err = null,
                currentVisits = '7',
                topPages = ['/', '5', '/a', '2'],
                callback = sinon.mock();

            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'topPages': []
            };
            for (var i=0; i<topPages.length; i+=2) {
                expectedHostInfo.topPages.push([topPages[i], topPages[i+1]]);
            }

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(7, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });

        it('no results hget', function() {
            var host = 'testhost.com',
                err = null,
                currentVisits = null,
                callback = sinon.mock();

            var expectedHostInfo = {
                currentVisits: null,
                topPages: null,
            };

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli.expects("zrevrangebyscore").never();
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });

        it('error in hget', function() {
            var host = 'testhost.com',
                err = {error: 'some error'},
                callback = sinon.mock();

            var expectedHostInfo = {
                currentVisits: null,
                topPages: null,
            };

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli.expects("zrevrangebyscore").never();
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, err, null)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });

        it('no result in zrevrangebyscore', function() {
            var host = 'testhost.com',
                err = null,
                currentVisits = '7',
                topPages = null,
                callback = sinon.mock();

            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'topPages': null
            };

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(7, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });

        it('empty result in zrevrangebyscore', function() {
            var host = 'testhost.com',
                err = null,
                currentVisits = '7',
                topPages = [],
                callback = sinon.mock();

            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'topPages': []
            };

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(7, null, topPages)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });

        it('error in zrevrangebyscore', function() {
            var host = 'testhost.com',
                err = {error: 'some error'},
                currentVisits = '7',
                callback = sinon.mock();

            var expectedHostInfo = {
                'currentVisits': currentVisits,
                'topPages': null
            };

            var mockRedisCli = sinon.mock(redisclient);
            mockRedisCli
                .expects("zrevrangebyscore")
                .once().withArgs(
                    'toppages-'+host,
                    '+inf', '-inf',
                    'WITHSCORES',
                    'LIMIT', 0, 10
                )
                .callsArgWith(7, err, null)
            ;
            mockRedisCli
                .expects("hget")
                .once().withArgs(host, 'curr_visits')
                .callsArgWith(2, null, currentVisits)
            ;

            _api().getHostInfo(host, callback);

            mockRedisCli.verify();
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, err, expectedHostInfo);
        });
    });

    describe('#registerPageView', function(){
        it('unique behavior', function() {
            var active_user = {
                'uid': 'unique user id',
                'host': 'host.com',
                'path': '/path1'
            };

            var mockRedisCli = sinon.mock(redisclient);
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
});
