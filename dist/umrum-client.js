
(function(win){
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
})(window);
