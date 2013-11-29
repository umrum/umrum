/* UMRUM client library */

(function(win, doc, undefined){
    var _server_ping = 'http://umrum.frontendbahia.com/ping',
        _server_ping_timeout = 10000,
        lib = win['umrum'] = win['umrum'] || {};

    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
    lib.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });

    var _location = win.location;
    lib.host = encodeURIComponent(_location.host.replace(/^www\./i, ''));

    var ping_server = function() {
        lib.path = encodeURIComponent(
            _location.pathname.replace(/^([^\/])/i, '/$1') + _location.hash
        );
        lib.title = encodeURIComponent(doc.title);

        var imgId = "umrum_ping",
            img = doc.getElementById(imgId),
            _exists = img != null;

        if ( !_exists ) {
            img = doc.createElement('img');
            img.id = imgId;
            img.style.position = 'absolute';
            img.style.top = img.style.left = '-1px';
            img.height = img.width = 1;
            doc.body.appendChild(img);
        }
        img.src = [
            _server_ping,
            "?uid=",
            lib.uid,
            "&host=",
            lib.host,
            "&path=",
            lib.path,
            "&title=",
            lib.title,
            "&t=",
            (+new Date)
        ].join('');
        setTimeout(ping_server, _server_ping_timeout);
    };
    ping_server();
})(window, document);
