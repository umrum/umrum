(function(){
    'use strict';

    const MAX_TOPPAGES = 10,
          USER_TIMEOUT = 5 * 60, // 5 min
          MAX_SIZE_PERFORMANCE_LIST = 49, // 0 index
          EXP_USER_PREFIX = 'expusr-';


    var config_redis = require('../../config/redisclient'),
        redisclient = null,
        pubsub_cli = null,
        _toppages_key = (hostId) => 'toppages:'+hostId,
        _servertime_key = (hostId) => 'servertime:'+hostId,
        _pageload_key = (hostId) => 'pageload:'+hostId,
        _list_average = (list) => {
            if (!list.length) {
                return 0;
            }
            return list.map(x => parseInt(x)).reduce((x, y) => x + y)/list.length;
        };


    var _api = {
        getHostInfo: (hostId, callback) => {
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

            let toppagesKey = _toppages_key(hostId),
                servertimeKey = _servertime_key(hostId),
                pageloadKey = _pageload_key(hostId),
                hostinfo = {
                    'currentVisits': null,
                    'topPages': null,
                    'serverTime': -1,
                    'pageLoadTime': -1
                };

            redisclient.hget(
                hostId, 'curr_visits'
            ).then((result) => {
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
            }).then((rs) => {
                // rs = [url, urlViwers, url2, url2Viewers...]
                hostinfo.topPages = !rs ? null : rs.map((item, idx, arr) => {
                    return (idx%2) ? null : {
                        'url': item, 'counter': arr[idx+1]
                    };
                }).filter((item) => item && item.counter)

                return redisclient.lrange(servertimeKey, 0, MAX_SIZE_PERFORMANCE_LIST);
            }).then((rs) => {
                hostinfo.serverTime = _list_average(rs);
                return redisclient.lrange(pageloadKey, 0, MAX_SIZE_PERFORMANCE_LIST);
            }).then((rs) => {
                hostinfo.pageLoadTime = _list_average(rs);
                callback(undefined, hostinfo);
                return undefined;
            }).catch((err) => {
                console.error(err);
                callback(err, hostinfo);
            });
        },
        registerPageView: (active_user) => {
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

            redisclient.hgetall(active_user.uid)
            .then((old_usr) => {
                let hostId = active_user.hostId,
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
            }).catch((err) => {
                console.error('Error in registerPageView', active_user, err);
            });
        },
        removePageView: (active_user) => {
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

            redisclient.hgetall(active_user.uid).then((old_usr) => {
                if (!old_usr || old_usr.url !== active_user.url) {
                    return;
                }
                console.log('remove user', active_user);
                let toppagesKey = _toppages_key(active_user.hostId);
                redisclient.multi();
                redisclient.del(active_user.uid);
                redisclient.hincrby(active_user.hostId, 'curr_visits', -1);
                redisclient.zincrby(toppagesKey, -1, active_user.url);
                redisclient.exec().then(console.log);
            }).catch((err) => {
                console.error('Error in removePageView', active_user, err);
            });
        }
    }


    module.exports = (() => {
        let lazy_api = {
            __init__: () => {
                redisclient = config_redis.init('default');
                pubsub_cli = config_redis.init('pubsub');
                pubsub_cli.config('set', 'notify-keyspace-events', 'KEx');

                // listening to expired events
                let expiredEvent = '__keyevent*__:expired';
                pubsub_cli.psubscribe(expiredEvent);
                pubsub_cli.on("pmessage", (pattern, channel, msg) => {
                    if (pattern !== expiredEvent) {
                        console.warn('Undesired event trigger', pattern);
                        return;
                    }

                    let uuid = msg.replace(EXP_USER_PREFIX, '');
                    console.log('expired user: ' + uuid);
                    redisclient.hgetall(uuid).then((err, active_usr) => {
                        if (!active_usr) {
                            console.error('Could not find user for ' + uuid);
                            return;
                        }
                        _api.removePageView(active_usr);
                    });
                });
            }
        };

        Object.keys(_api).forEach(method => {
            lazy_api[method] = function() {
                try {
                    if ( !redisclient ) {
                        lazy_api.__init__();
                    }
                    let args = Array.prototype.slice.call(arguments, 0);
                    return _api[method].apply(_api, args);
                } catch(e) {
                    console.error('Error executing redis[' + method + ']', e);
                }
            };
        });
        return lazy_api;
    })();
})();
