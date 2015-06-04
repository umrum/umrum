var config_redis = require('../../config/redisclient');

var MAX_TOPPAGES = 10,
    USER_TIMEOUT = 5 * 60, // 5 min
    MAX_SIZE_PERFORMANCE_LIST = 49, // 0 index
    EXP_USER_PREFIX = 'expusr-',
    redisclient = null,
    pubsub_cli = null;

var _toppages_key = function(hostId) {
    return 'toppages:'+hostId;
}
var _servertime_key = function(hostId) {
    return 'servertime:'+hostId;
}
var _pageload_key = function(hostId) {
    return 'pageload:'+hostId;
}

var _list_average = function(list) {
    var sum = list.reduce(function(prev, curr){
        return prev + parseInt(curr, 10);
    }, 0);
    return sum ? Math.round(sum/list.length) : 0;
}

var _api = {
    getHostInfo: function(hostId, callback) {
        /*
        This function should returns a map with the current visitors of
        the host and the top pages.

        @callback will receive hostinfo map as parameter

        hostinfo map: {
            currentVisits: 123,
            topPages: [[path, currVisits], ...],
            serverTime: 444,
            pageLoadTime: 2456
        }
        */

        var hostinfo = {
                currentVisits: null,
                topPages: null,
                serverTime: -1,
                pageLoadTime: -1
            },
            toppagesKey = _toppages_key(hostId),
            servertimeKey = _servertime_key(hostId),
            pageloadKey = _pageload_key(hostId);

        redisclient.hget(
            hostId, 'curr_visits'
        ).then(function(result){
            if (!result) {
                throw new Error('No visitors');
            }

            hostinfo.currentVisits = result;
            return redisclient.zrevrangebyscore(
                toppagesKey,
                '+inf', '-inf',
                'WITHSCORES',
                'LIMIT', 0, MAX_TOPPAGES
            );
        }).then(function(result) {
            // result = [url, urlViwers, url2, url2Viewers...]
            hostinfo.topPages = !result ? null : result.map(function(item, idx, arr){
                if (idx%2) return null;
                return {
                  url: item,
                  counter: parseInt(arr[idx+1], 10)
                };
            }).filter(function(item){
                return item && item.counter;
            });

            return redisclient.lrange(servertimeKey, 0, MAX_SIZE_PERFORMANCE_LIST);
        }).then(function(result){
            hostinfo.serverTime = _list_average(result);
            return redisclient.lrange(pageloadKey, 0, MAX_SIZE_PERFORMANCE_LIST);
        }).then(function(result){
            hostinfo.pageLoadTime = _list_average(result);
            callback(undefined, hostinfo);
            return undefined;
        }).catch(function(err){
            console.error(err);
            callback(err, hostinfo);
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
        console.log('rediscli.regsiterPageView', active_user);
        redisclient.hgetall(active_user.uid).then(function(old_usr){
            console.log('rediscli.regsiterPageView', old_usr);
            var hostId = active_user.hostId,
                toppagesKey = _toppages_key(active_user.hostId),
                servertimeKey = _servertime_key(active_user.hostId),
                pageloadKey = _pageload_key(active_user.hostId);

            redisclient.multi();
            if (!old_usr) {
                console.log('new active user', active_user);
                redisclient.hincrby(active_user.hostId, 'curr_visits', 1);
                redisclient.zincrby(toppagesKey, 1, active_user.url);
                if (active_user.servertime) {
                    redisclient.lpush(servertimeKey, active_user.servertime);
                    redisclient.ltrim(servertimeKey, 0, MAX_SIZE_PERFORMANCE_LIST);
                }
                if (active_user.pageload) {
                    redisclient.lpush(pageloadKey, active_user.pageload);
                    redisclient.ltrim(pageloadKey, 0, MAX_SIZE_PERFORMANCE_LIST);
                }
            } else if (old_usr.url != active_user.url) {
                console.log('old user update', old_usr, active_user);
                redisclient.zincrby(toppagesKey, -1, old_usr.url);
                redisclient.zincrby(toppagesKey, 1, active_user.url);
            }

            redisclient.hmset(active_user.uid, active_user);
            redisclient.setex(EXP_USER_PREFIX + active_user.uid, USER_TIMEOUT, 1);
            redisclient.exec().then(console.log);
        }).catch(function(err){
            console.error('Error in registerPageView', active_user, err);
        });
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

        redisclient.hgetall(active_user.uid).then(function(old_usr){
            if (old_usr && old_usr.url === active_user.url) {
                console.log('remove user', active_user);
                var toppagesKey = _toppages_key(active_user.hostId);

                redisclient.multi();
                redisclient.del(active_user.uid);
                redisclient.hincrby(active_user.hostId, 'curr_visits', -1);
                redisclient.zincrby(toppagesKey, -1, active_user.url);
                redisclient.exec().then(console.log);
            }
        }).catch(function(err){
            console.error('Error in removePageView', active_user, err);
        });
    }
}


module.exports = (function(){
    var lazy_api = {
        __init__: function () {
            redisclient = config_redis.init('default');
            pubsub_cli = config_redis.init('pubsub');
            pubsub_cli.config('set', 'notify-keyspace-events', 'KEx');

            // listening to expired events
            var expiredEvent = '__keyevent*__:expired';
            pubsub_cli.psubscribe(expiredEvent);
            pubsub_cli.on("pmessage", function(pattern, channel, msg) {
                if (pattern !== expiredEvent) {
                    console.warn('Undesired event trigger', pattern);
                    return;
                }

                var uuid = msg.replace(EXP_USER_PREFIX, '');
                console.log('expired user: ' + uuid);
                redisclient.hgetall(uuid).then(function(err, active_usr){
                    if (!active_usr) {
                        console.error('Could not find user for ' + uuid);
                        return;
                    }
                    _api.removePageView(active_usr);
                });
            });
        }
    };

    Object.keys(_api).forEach(function(method){
        lazy_api[method] = (function(m){
            return function(){
                try {
                    if ( !redisclient ) {
                        lazy_api.__init__();
                    }
                    var _args = Array.prototype.slice.call(arguments, 0);
                    return _api[m].apply(_api, _args);
                } catch(e) {
                    console.error('Error executing redis[' + m + ']', e);
                }
            }
        })(method);
    });
    return lazy_api;
})();

