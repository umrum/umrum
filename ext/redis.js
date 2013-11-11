/* global module, require */

var redisclient = require('../config/redisclient');

var getHostInfo = function(host) {
    /*
    This function should returns a map with the current visitors of
    the host and the top pages.
    return {
        currentVisits: 123,
        topPages: [{
            'currentVisits': 10,
            'title': 'Lorem Ipsum'
        }]
    }
    */
    var currentVisits = redisclient.get(host);
    var hostHash = host;
    var topPages = redisclient.zrangebyscore(hostHash, '-inf +inf', 'WITHSCORES', 'LIMIT 0 10');

    var formatTopPages = function() {
        var formatted = [];
        for (var i = 0; i < topPages.length; i++) {
            // We don't have a hashLib defined
            var path = hashLib.decript(topPages[i]['pathHash']);
            formatted.push({
                'currentVisits': topPages[i]['count'],
                'path': path
            });
        };
        return formatted;
    }
    return {
        currentVisits: currentVisits,
        topPages: formatTopPages
    }
}

var registerPageView = function(uid, host, path) {
    /*
    This function should increment the number of visitiors of host
    and adds the pam of this request (stores path) with expires:

    - host.currentVisits += 1  # with expire 10s
    - paths.incr(path)  # with expire 10s
    */
    var pathHash = hashLib.encript(path);
    redisclient.incr(host);
    // zincrby path 1 "path"
    redisclient.zincrby(pathHash, 1, "path");
}

var removePageView = function(host, path) {
    redisclient.decr(host);
    redisclient.zincrby(pathHash, -1, "path");
}

module.exports = {
    getHostInfo: getHostInfo,
    registerPageView: registerPageView,
    removePageView: removePageView
}


// Counter visualization
// redisclient = require('../config/redis');
// redisclient.subscribe('realtime');

// subscribe.on("message", function(channel, message) {
//     client.send(message);
// });
