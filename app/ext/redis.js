/* global module, require */

var redisclient = require('../config/redisclient');

var _MAX_TOPPAGES = 10;

var _toppages_key = function(hostId) {
    return 'toppages:'+hostId;
}

var _lazy_api = {
    getHostInfo: function(hostId, callback) {
        /*
        This function should returns a map with the current visitors of
        the host and the top pages.

        @callback will receive hostinfo map as parameter

        hostinfo map: {
            currentVisits: 123,
            topPages: [[path, currVisits], ...]
        }
        */

        hostinfo = {
            currentVisits: null,
            topPages: null
        };
        redisclient.hget(hostId, 'curr_visits', function(err, result){
            if ( err || !result ) return callback(err, hostinfo);

            hostinfo.currentVisits = result;
            redisclient.zrevrangebyscore(
                _toppages_key(hostId),
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, _MAX_TOPPAGES,
                function(err, result) {
                    if ( err || !result ) return callback(err, hostinfo);

                    hostinfo.topPages = [];
                    for (var i=0; i<result.length; i+=2) {
                        hostinfo.topPages.push([result[i], result[i+1]]);
                    }

                    callback(err, hostinfo);
                }
            );
        });
    },
    registerPageView: function(active_user) {
        /*
        This function must save the active user and increment its host attributes
        like current_visits total and for its url

        - active_user : JSON {
          - hostId: id from host being accessed
          - url: url being accessed
          - title: meta title for the url
          - uuid: user ID
        }
        */

        console.log(active_user);
        redisclient.hmset(active_user.uid, active_user, console.log);
        redisclient.hincrby(active_user.hostId, 'curr_visits', 1, console.log);
        redisclient.zincrby(_toppages_key(active_user.hostId), 1, active_user.url, console.log);
    },
    removePageView: function(active_user) {
        /*
        This function must remove the active user and decrement its host attributes
        like current_visits total and for its url

        - active_user : JSON {
          - hostId: id from host being accessed
          - url: url being accessed
          - title: meta title for the url
          - uuid: user ID
        }
        */

        redisclient.del(active_user.uid);
        redisclient.hincrby(active_user.hostId, 'curr_visits', -1);
        redisclient.zincrby(_toppages_key(active_user.hostId), -1, active_user.url);
    }
}

module.exports = (function(){
    var api = {};

    for ( method in _lazy_api ) {
        api[method] = (function(method){
            return function(){
                if ( redisclient.init ) {
                    redisclient = redisclient.init();
                }
                var _args = Array.prototype.slice.call(arguments,0);
                return _lazy_api[method].apply(null, _args);
            }
        })(method);
    }
    return api;
})();

