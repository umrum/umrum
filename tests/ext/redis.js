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
    });
});