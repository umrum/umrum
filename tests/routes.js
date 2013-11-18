/* global require, describe, it */

var app = require('../server').app;
var request = require('supertest');

describe('Tests the index route', function(){

    it('should return 200 status code', function(done){
        request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });

});

describe('Tests the ping route', function(){

    it('should return 200 status code', function(done){
        request(app)
            .get('/ping')
            .expect(200)
            .end(done);
    });

});

describe('Tests the errors route', function(){

    it('should return 404 status code', function(done){
        request(app)
            .get('/not-found')
            .expect(404)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });

});
