/* global require, describe, it, __dirname */

var env = require('../config/env');
var assert = require('assert');
var path = require('path');

describe('Tests the app module', function(){

    it('should return the correct port variable for develop NODE_ENV', function() {
        assert.equal(env.port, 8000);
    });

    // it('should return the correct port variable for production NODE_ENV', function() {
    //     process.env.NODE_ENV = 'production';

    //     assert.equal(env.port, 80);

    //     process.env.NODE_ENV = 'test';
    // });

    it('should return the correct views variable', function() {
        assert.equal(env.views, path.normalize(path.join(__dirname, '../views/')));
    });

    it('should return the correct assetsPath variable', function() {
        assert.equal(env.assetsPath, path.normalize(path.join(__dirname, '../assets/')));
    });

    it('should return the correct assetsURL variable', function() {
        assert.equal(env.assetsURL, '/assets/');
    });

});
