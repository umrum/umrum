/* global require, describe, it */

var app = require('../config/app');
var request = require('supertest');

describe('Tests the index route', function(){

    it('should return 200 status code', function(done){
        require('../routes/index.js');

        request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });
});

describe('Tests the counter route', function(){

    it('should return 200 status code', function(done){
        require('../routes/counter.js');

        request(app)
            .get('/counter')
            .expect(200)
            .end(done);
    });
});
