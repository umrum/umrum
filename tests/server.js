/* global describe, it, before, __dirname */

var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    env = require('../app/config/env'),
    path = require('path')
;

describe('server.js', function(){
    var io,
        walker,
        express_app,
        srv_requires,
        express_listening,
        minifyMock;

    before(function() {
        express_listening = Math.random();
        express_app = {
            use: sinon.spy(),
            set: sinon.spy(),
            engine: sinon.spy(),
            listen: sinon.stub().returns(express_listening),
            router: Math.random(),
            locals: {}
        };

        minifyMock = sinon.spy();
        minifyMock['@noCallThru'] = true;

        io = {set: sinon.spy()};
        walker = {
            on: sinon.stub(),
            walk: sinon.spy(),
        };
        walker.on.returns(walker);

        srv_requires = {
            'express': sinon.stub().returns(express_app),
            'mongoose': {connect: sinon.spy()},
            'nunjucks': {configure: sinon.spy(), render: 'render'},
            'passport': {initialize: sinon.spy(), session: sinon.spy()},
            'socket.io': {listen: sinon.stub().returns(io)},
            'filewalker': sinon.stub().returns(walker),

            './app/config/authentication': sinon.spy(),
            './app/config/middlewares/render-minified': minifyMock,

            './app/routes/api': sinon.spy(),
            './app/routes/index': sinon.spy(),
            './app/routes/errors': sinon.spy(),
            './app/routes/dashboard': sinon.spy(),
            './app/routes/authentication': sinon.spy()
        };

        var express_methods = [
            'json',
            'logger',
            'static',
            'session',
            'favicon',
            'compress',
            'urlencoded',
            'cookieParser',
        ];
        for (var idx in express_methods) {
            var method = express_methods[idx];
            var result = Math.random()+idx;
            srv_requires.express[method+'-rs'] = result;
            srv_requires.express[method] = sinon.stub().returns(result);
        }

        for (var key in srv_requires) {
            if (srv_requires.hasOwnProperty(key)) {
                srv_requires[key]['@noCallThru'] = true;
            }
        }

        // run server.js
        proxyquire('../server', srv_requires);
    });

    it('mongoose config', function() {
        assert(srv_requires.mongoose.connect.calledOnce);
        assert(srv_requires.mongoose.connect.calledWith(env.MONGO_URI));

        // auto load mongo models
        assert(srv_requires.filewalker.calledOnce);
        assert(srv_requires.filewalker.calledWith(
            env.modelsPath, {matchRegExp: /.*\.js/i}
        ));
        assert(walker.on.calledOnce);
        assert(walker.on.calledWith('file'));
        assert(walker.walk.calledOnce);
        assert(walker.walk.calledAfter(walker.on));
    });

    it('express call, set views and template engine', function() {
        assert(srv_requires.express.calledOnce);
        assert(srv_requires.express.calledWith());

        express_app.assetsURL = env.assetsURL;

        assert(express_app.set.calledOnce);
        assert(express_app.set.calledWithExactly('views', env.views));

        assert(express_app.engine.calledOnce);
        assert(express_app.engine.calledWithExactly(
            'html', srv_requires.nunjucks.render
        ));
    });

    it ('ensure html minification is being called', function() {
        assert( express_app.use.calledWith(minifyMock) );
    });

    it('express configure method#use', function() {

        // ensure that first call of app.use is express.compress
        express_app.use.getCall(0).calledWithExactly(
            srv_requires.express['compress-rs']
        );

        var simple_exp_methods = [
            'json',
            'logger',
            'favicon',
            'session',
            'compress',
            'urlencoded',
            'cookieParser'
        ];
        for (var idx in simple_exp_methods) {
            var method = simple_exp_methods[idx];
            var use_method = express_app.use.withArgs(
                srv_requires.express[method+'-rs']
            );
            assert(srv_requires.express[method].calledOnce);
            assert(use_method.calledOnce);
            assert(use_method.calledAfter(srv_requires.express[method]));
        }

        assert(srv_requires.express.session.calledWith({secret: 'umrum-ftw'}));
    });

    it('routes configurations', function() {
        assert(srv_requires['./app/routes/authentication'].calledOnce);
        assert(srv_requires['./app/routes/authentication'].calledWith(
            express_app, srv_requires.passport
        ));

        var simple_routes = ['index', 'api', 'dashboard', 'errors'];
        for (var idx in simple_routes) {
            var route_mod = srv_requires['./app/routes/'+simple_routes[idx]];
            assert(route_mod.calledOnce);
            assert(route_mod.calledWithExactly(express_app));
        }
    });

    it('static routes configurations', function() {
        var static_assets = srv_requires.express.static.withArgs(
                env.assetsPath, {maxAge: 24*60*60*1000}
            ),
            static_dist = srv_requires.express.static.withArgs(
                path.join(__dirname, '..', 'dist')
            ),
            route_assets = express_app.use.withArgs(
                env.assetsURL, srv_requires.express['static-rs']
            ),
            route_dist = express_app.use.withArgs(
                '/dist/', srv_requires.express['static-rs']
            )
        ;

        assert(static_assets.calledOnce);
        assert(static_assets.calledBefore(route_assets));
        assert(route_assets.calledOnce);
        assert(route_assets.calledBefore(route_dist));

        assert(static_dist.calledOnce);
        assert(static_dist.calledBefore(route_dist));
        assert(route_dist.calledOnce);

        assert(route_dist.calledBefore(
            srv_requires['./app/routes/authentication']
        ));
    });

    it('express listen', function() {
        assert(express_app.listen.calledOnce);
        assert(express_app.listen.calledWith(env.port, env.ipaddr));
    });

    it('io listen', function() {
        assert(srv_requires['socket.io'].listen.calledOnce);
        assert(srv_requires['socket.io'].listen.calledWith(express_listening));

        assert(io.set.calledOnce);
        assert(io.set.calledWithExactly('log level', 2));
    });
});
