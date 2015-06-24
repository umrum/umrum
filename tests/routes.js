/* global describe, it, before, after */

var app = require('../server').app;
var request = require('supertest');

describe('Tests the index route', function(){
    it('should return status code 200', function(done){
        request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });
});

describe('Tests API routes', function(){
    var encodedUrl = 'https%3A%2F%2Fgithub.com%2Fumrum',
        hostId = 'HOST_ID_3233',
        uid = 'UID-78946';

    describe('api#ping', function(){
        it('no hostId -> error 500', function(done){
            request(app)
                .get('/api/ping?uid='+uid+'&url='+encodedUrl)
                .expect(500)
                .end(done);
        });

        it('no url -> error 500', function(done){
            request(app)
                .get('/api/ping?uid='+uid+'&hostId='+hostId)
                .expect(500)
                .end(done);
        });

        it('no uid -> error 500', function(done){
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

    describe('api#disconnect', function(){
        it('no hostId -> error 500', function(done){
            request(app)
                .get('/api/disconnect?uid='+uid+'&url='+encodedUrl)
                .expect(500)
                .end(done);
        });

        it('no url -> error 500', function(done){
            request(app)
                .get('/api/disconnect?uid='+uid+'&hostId='+hostId)
                .expect(500)
                .end(done);
        });

        it('no uid -> error 500', function(done){
            request(app)
                .get('/api/disconnect?url='+encodedUrl+'&hostId='+hostId)
                .expect(500)
                .end(done);
        });

        it('ok 200', function(done){
            request(app)
                .get('/api/disconnect?hostId='+hostId+'&uid='+uid+'&url='+encodedUrl)
                .expect(200)
                .end(done);
        });
    });
});

describe('Tests the errors route', function(){
    it('should return status code 404', function(done){
        request(app)
            .get('/not-found')
            .expect(404)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });
});

describe('Tests /api/dashboard routes', function(){
    it('Anonymous access to /create must return 401', function(done){
        request(app)
            .post('/api/dashboard/create')
            .expect(401)
            .end(done);
    });

    ['/dashboard', '/dashboard/myhost.com'].forEach(function(url){
        it('Ensure that ' + url + ' requires login', function(done){
            request(app)
                .get('/dashboard')
                .expect(302)
                .expect('location', '/signin')
                .expect(function(res){
                    return (/github.com\/login\/oauth\/authorize/).test(
                        res.headers.location
                    );
                })
                .end(done);
        });
    });

    describe('Error handlers', function() {
        var _http, _original_req;
        before(function() {
            _http = require('http');
            _original_req = _http.IncomingMessage.prototype;
            _http.IncomingMessage.prototype.isAuthenticated = function() {
                return true;
            };
        });
        after(function() {
            _http.IncomingMessage.prototype = _original_req;
        });

        it('404 when accessing non existent host', function(done) {
            request(app)
                .get('/dashboard/non-existent.host')
                .expect(404)
                .end(done);
        });
    });
});
