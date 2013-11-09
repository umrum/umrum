/* UMRUM client library */

(function(win, doc){
    var _server_ping = 'http://frontend-bahia.2013.nodeknockout.com/ping';
    var _server_ping_timeout = 10000;
    var lib = win['umrum'] =  win['umrum'] || {};

    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
    lib.uid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    lib.host = win.location.host.replace(/^www\./i, '');
    lib.path = win.location.pathname.replace(/([^\/])/i, '/$1');

    var ping_server = function(){
      var img = doc.createElement('img');
      img.src = [
        _server_ping,
        "?uid=",
        encodeURIComponent(lib.uid),
        "&host=",
        encodeURIComponent(lib.host),
        "&path=",
        encodeURIComponent(lib.path)
      ].join('');
      img.height = img.width = 1;
      doc.body.appendChild(img);
      setTimeout(ping_server, _server_ping_timeout);
    };
    ping_server();
})(window, document);
