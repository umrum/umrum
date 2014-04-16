/* UMRUM client library */

(function(win, doc, undefined){
    var _server_ping = 'http://umrum.frontendbahia.com/ping',
        _server_ping_timeout = 15 * 1000,
        lib = win._mrm = win._mrm || {},
        1rum_ckn = '__1rum',
        ping_fn;

    doc.cookie.split(';').forEach(function(cookie){
        if (cookie.indexOf(1rum_ckn) == 0) {
            lib.uid = cookie.replace(1rum_ckn+'=', '');
        }
    });

    if (!lib.uid) {
        var domain = '.'+win.location.host.replace('www.','');
        // http://stackoverflow.com/q/105034/1197796#answer-2117523
        lib.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        doc.cookie = 1rum_ckn + '=' + lib.uid + ';expires=new Date((+new Date)+7*24*60*60*1000).toUTCString()';
    }

    ping_fn = function() {
        lib.url = encodeURIComponent(win.location.href);
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
            "?uid=", lib.uid,
            "&hostId=", lib.hostId,
            "&url=", lib.url,
            "&title=", lib.title,
            "&t=", (+new Date)
        ].join('');
        setTimeout(ping_fn, _server_ping_timeout);
    };
    ping_fn();
})(window, document);
