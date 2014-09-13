/* global describe, it, __dirname */

var env = require('../config/env');
var assert = require('assert');
var path = require('path');

describe('Tests the env module', function(){

    it('should return the correct port variable for develop NODE_ENV', function() {
        assert.equal(env.port, 8000);
    });

    it('should return the correct views variable', function() {
        assert.equal(env.views, path.join(__dirname, '../app/views/'));
    });

    it('should return the correct assetsPath variable', function() {
        assert.equal(env.modelsPath, path.join(__dirname, '../app/models'));
    });

    it('should return the correct assetsPath variable', function() {
        assert.equal(env.assetsPath, path.join(__dirname, '../public/'));
    });

    it('should return the correct assetsURL variable', function() {
        assert.equal(env.assetsURL, '/public/');
    });

});
