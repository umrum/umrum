/* UMRUM client library */

(function(win, doc){
    var CONFIG = win._mrm || {},
        COOKIE_NAME = 'umrum_uid',
        USER_ACTIVE;

    // def user uid
    var cookies = doc.cookie.split(';'),
        cookieIdx = cookies.length;
    while (cookieIdx) {
        var cookie = cookies[--cookieIdx].replace(/^\s+/, '');
        if (cookie.indexOf(COOKIE_NAME) == 0) {
            CONFIG.uid = cookie.replace(COOKIE_NAME+'=', '');
        }
    }
    if (!CONFIG.uid) {
        var domain = '.'+win.location.host.replace('www.','');
        // http://stackoverflow.com/q/105034/1197796#answer-2117523
        CONFIG.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        var weekAhead = new Date((+new Date)+7*24*60*60*1000).toUTCString();
        doc.cookie = COOKIE_NAME + '=' + CONFIG.uid + ';expires=' + weekAhead;
    }

    // def umrum API
    var API = {
        API_URL: 'http://umrum.io/api',
        elementID: 'umrumAPI',
        element: null,
        init: function(){
            var img = doc.getElementById(this.elementID);
            if (!img) {
                img = doc.createElement('img');
                img.id = this.elementID;
                img.style.position = 'absolute';
                img.style.top = img.style.left = '-1px';
                img.height = img.width = 1;
                doc.body.appendChild(img);

                USER_ACTIVE = true;
                this.ping();
            }
            this.element = img;
        },
        send: function(route){
            if (!this.element) {
                this.init();
            }
            var url = encodeURIComponent(win.location.href),
                title = encodeURIComponent(doc.title),
                servertime = '',
                pageload = '',
                perf = win.performance;
            if (perf && perf.timing) {
                var t = perf.timing,
                    start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
                servertime = t.responseStart - start;
                pageload = t.loadEventStart - start;
            }

            this.element.src = [
                this.API_URL+route,
                "?uid=", CONFIG.uid,
                "&hostId=", CONFIG.hostId,
                "&url=", url,
                "&title=", title,
                "&servertime=", servertime,
                "&pageload=", pageload,
                "&t=", (+new Date)
            ].join('');
        },
        ping: function(){
            if ( USER_ACTIVE ) {
                USER_ACTIVE = false;
                this.send('/ping');
            }
            var _api = this;
            this.ping_timeout = setTimeout(function(){
                _api.ping();
            }, 30 * 1000);
        },
        exit: function(cancelPing){
            USER_ACTIVE = false;
            this.send('/disconnect');
            clearTimeout(this.ping_timeout);
        }
    };

    // utility function to concat functions
    var concatFunctions = function(fn1, fn2){
        return function(){
            var args = Array.prototype.slice.call(arguments, 0);
            if (fn1) {
                try{
                fn1.apply(this, args);
                } catch(err) { console.error(err); }
            }
            fn2.apply(this, args);
        };
    };

    // cross addEvent method
    var addEvent = function(){};
    if(doc.addEventListener) {
        addEvent = function (elem, type, handler, useCapture){
            elem.addEventListener(type, handler, !!useCapture);
        }
    } else if (doc.attachEvent) {
        addEvent = function (elem, type, handler) {
            type = "on" + type;
            elem.attachEvent(type, function(){ handler.apply(elem, arguments) });
        }
    }

    // adding page interaction interaction listeners
    var activate_user = function(){ USER_ACTIVE = true; };
    addEvent(win, 'scroll', activate_user);
    addEvent(doc.body, 'click', activate_user);
    addEvent(doc.body, 'mouseover', activate_user);

    // adding leave page listeners
    var inactivate_user = function(){ USER_ACTIVE = false; };
    win.onblur = concatFunctions(win.onblur, inactivate_user);
    addEvent(win, 'beforeunload', function(){ API.exit(); });

    // init track
    API.init();
})(window, document);
