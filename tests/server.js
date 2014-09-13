/* global describe, it, before, __dirname */

var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    env = require('../config/env'),
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

            './config/authentication': sinon.spy(),
            './config/middlewares/render-minified': minifyMock,

            './app/routes/api': sinon.spy(),
            './app/routes/index': sinon.spy(),
            './app/routes/errors': sinon.spy(),
            './app/routes/dashboard': sinon.spy(),
            './app/routes/authentication': sinon.spy(),

            'compression': sinon.stub().returns('compression'),
            'morgan': sinon.stub().returns('morgan'),
            'body-parser': {
                json: sinon.stub().returns('body-parser-json'),
                urlencoded: sinon.stub().returns('body-parser-urlencoded')
            },
            'cookie-parser': sinon.stub().returns('cookie-parser'),
            'express-session': sinon.stub().returns('express-session'),
            'serve-static': sinon.stub().returnsArg(0)
        };

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

        var cookieParser = srv_requires['cookie-parser'],
            serveStatic = srv_requires['serve-static'],
            compression = srv_requires['compression'],
            bodyParser = srv_requires['body-parser'],
            session = srv_requires['express-session'],
            morgan = srv_requires['morgan'];

        // ensure that first call of app.use is express.compress
        assert(express_app.use.getCall(0).calledWithExactly('compression'));
        assert(compression.calledWithExactly());

        assert(express_app.use.withArgs('morgan').calledOnce);
        assert(morgan.calledOnce);
        assert.equal(morgan.firstCall.args.length, 1);
        assert.deepEqual(Object.keys(morgan.firstCall.args[0]), [
            'format',
            'buffer',
            'skip'
        ]);
        assert.equal(morgan.firstCall.args[0].format, [
          ':date',
          '(:req[X-Forwarded-For], :remote-addr)',
          ':method | :url | :user-agent',
          ':response-time ms'
        ].join(' - '));
        assert.equal(morgan.firstCall.args[0].buffer, 200);
        assert(morgan.firstCall.args[0].skip instanceof Function);

        assert(express_app.use.withArgs('body-parser-json').calledOnce);
        assert(bodyParser.json.calledWithExactly());

        assert(express_app.use.withArgs('body-parser-urlencoded').calledOnce);
        assert(bodyParser.urlencoded.calledWithExactly({extended: false}));

        assert(express_app.use.withArgs('cookie-parser').calledOnce);
        assert(cookieParser.calledWithExactly('umrum-cookie-key'));

        assert(express_app.use.withArgs('express-session').calledOnce);
        assert(session.calledWithExactly({
            saveUninitialized: true, resave: true, secret: 'umrum-session-key'
        }));

        assert(serveStatic.calledTwice);
        assert(serveStatic.calledWithExactly(
            env.assetsPath,
            {maxAge: 24*60*60*1000}
        ));
        assert(serveStatic.calledWithExactly(
            path.join(__dirname, '..', 'dist')
        ));

        assert(express_app.use.withArgs(env.assetsURL, env.assetsPath).calledOnce);
        assert(express_app.use.withArgs('/dist/', path.join(__dirname, '..', 'dist')).calledOnce);
    });

    it('routes configurations', function() {
        assert(srv_requires['./app/routes/authentication'].calledOnce);
        assert(srv_requires['./app/routes/authentication'].calledWith(
            express_app, srv_requires.passport
        ));

        ['index', 'api', 'dashboard', 'errors'].forEach(function(route){
            var route_mod = srv_requires['./app/routes/' + route];
            assert(route_mod.calledOnce);
            assert(route_mod.calledWithExactly(express_app));
        });
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
