/* global require, describe, it */

var redisclient = require('../config/redisclient');
var app = require('../config/app');
var env = require('../config/env');
var nunjucks = require('nunjucks');
var assert = require('assert');

describe('Tests the app module', function(){

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
