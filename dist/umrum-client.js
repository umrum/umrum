/* UMRUM client library */

(function(win, doc, undefined){
    var _1rumObj = win._mrm || {},
        _1rumCookieName = '__1rum';

    // def user uid
    var cookies = doc.cookie.split(';'),
        cookieIdx = cookies.length;
    while (cookieIdx) {
        if (cookies[--cookieIdx].indexOf(_1rumCookieName) == 0) {
            _1rumObj.uid = cookie.replace(_1rumCookieName+'=', '');
        }
    }
    if (!_1rumObj.uid) {
        var domain = '.'+win.location.host.replace('www.','');
        // http://stackoverflow.com/q/105034/1197796#answer-2117523
        _1rumObj.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        var weekAhead = new Date((+new Date)+7*24*60*60*1000).toUTCString();
        doc.cookie = _1rumCookieName + '=' + _1rumObj.uid + ';expires=' + weekAhead;
    }

    // def 1rum API
    var _1rumAPI = {
        API_URL: 'http://umrum.frontendbahia.com/api',
        elementID: '__1rumAPI',
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
            }
            this.element = img;
        },
        send: function(route){
            if (!this.element) {
                this.init();
            }
            _1rumObj.url = encodeURIComponent(win.location.href);
            _1rumObj.title = encodeURIComponent(doc.title);
            this.element.src = [
                this.API_URL+route,
                "?uid=", _1rumObj.uid,
                "&hostId=", _1rumObj.hostId,
                "&url=", _1rumObj.url,
                "&title=", _1rumObj.title,
                "&t=", (+new Date)
            ].join('');
        },
        ping: function(){
            if ( _1rumObj.interaction ) {
                _1rumObj.interaction = false;
                this.send('/ping');
            }
            var _api = this;
            this.ping_timeout = setTimeout(function(){
                _api.ping();
            }, 30 * 1000);
        },
        exit: function(cancelPing){
            _1rumObj.interaction = false;
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
    addEvent(win, 'scroll', function(){ _1rumObj.interaction = true; });
    addEvent(doc.body, 'click', function(){ _1rumObj.interaction = true; });
    var bodyChildren = Array.prototype.slice.call(doc.body.children, childIdx);
    var childIdx = bodyChildren.length;
    while (childIdx) {
        addEvent(
            bodyChildren[--childIdx],
            'mouseover',
            function(){ _1rumObj.interaction = true; }
        );
    }

    // adding leave page listeners
    win.onblur = concatFunctions(window.onblur, function(){
        _1rumObj.interaction = false;
    });
    addEvent(win, 'beforeunload', function(){
        _1rumAPI.exit();
    });

    // init track
    _1rumObj.interaction = true;
    _1rumAPI.init();
    _1rumAPI.ping();
})(window, document);
