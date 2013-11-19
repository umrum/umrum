/* global require, describe, it, before, after */

var assert = require('assert'),
    nunjucks = require('nunjucks'),
    server = require('../server'),
    env = require('../app/config/env'),
    redisclient = require('../app/config/redisclient'),
    app = null
;

describe('Tests the app module', function(){

    before(function(done) {
        app = server.app;
        done();
    });

    after(function(done) {
        server.instance.close();
        done();
    });

    it('should return the correct assets variable from local', function() {
        assert.equal(app.locals.assetsURL, env.assetsURL);
    });

    it('should return the correct views configuration', function() {
        assert.equal(app.settings.views, env.views);
    });

    it('should return the correct engine', function() {
        assert.equal(app.engines['.html'], nunjucks.render);
    });

    it('should return the correct variable for redis', function() {
        assert.deepEqual(app.settings.redis, redisclient);
    });

});
