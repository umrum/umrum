/* global require, describe, it */

var app = require('../config/app');
var env = require('../config/env');
var assert = require('assert');
var nunjucks = require('nunjucks');

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

});
