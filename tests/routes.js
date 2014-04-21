/* global describe, it */

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

describe('Tests api routes', function(){
    var encodedUrl = 'https%3A%2F%2Fgithub.com%2Ffrontendbahia',
        hostId = 'HOST_ID_3233',
        uid = 'UID-78946';

    describe('api#ping', function(){
        it('no hostId -> erro 500', function(done){
            request(app)
                .get('/api/ping?uid='+uid+'&url='+encodedUrl)
                .expect(500)
                .end(done);
        });

        it('no url -> erro 500', function(done){
            request(app)
                .get('/api/ping?uid='+uid+'&hostId='+hostId)
                .expect(500)
                .end(done);
        });

        it('no uid -> erro 500', function(done){
            request(app)
                .get('/api/ping?url='+encodedUrl+'&hostId='+hostId)
                .expect(500)
                .end(done);
        });

        it('ok 200', function(done){
            request(app)
                .get('/api/ping?hostId='+hostId+'&uid='+uid+'&url='+encodedUrl)
                .expect(200)
                .end(done);
        });
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
