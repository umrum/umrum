/* global describe, it, beforeEach */

var assert = require('assert'),
    sinon = require('sinon');

describe('authorization.js', function(){

    var _req,
        _res,
        next_spy;

    var auth_module = require('../../config/middlewares/authorization');

    beforeEach(function(){
        _req = {};
        _res = {};
        next_spy = sinon.spy();
    });

    describe('#requiresLogin', function() {
        it('isAuthenticated === false', function(){
          _req.isAuthenticated = sinon.stub().returns(false);
          _res.send = sinon.spy();

          auth_module.requiresLogin(_req, _res, next_spy);

          assert(!next_spy.called);
          assert(_req.isAuthenticated.calledWithExactly());
          assert(_res.send.calledWithExactly(401, 'User is not authorized'));
        });

        it('isAuthenticated === true', function(){
          _req.isAuthenticated = sinon.stub().returns(true);
          _res.send = sinon.spy();

          auth_module.requiresLogin(_req, _res, next_spy);

          assert(next_spy.calledWithExactly());
          assert(_req.isAuthenticated.calledWithExactly());
          assert(!_res.send.called);
        });
    });


    describe('#redirectAnonymous', function() {
        it('isAuthenticated === false', function(){
          _req.isAuthenticated = sinon.stub().returns(false);
          _res.redirect = sinon.spy();

          auth_module.redirectAnonymous(_req, _res, next_spy);

          assert(!next_spy.called);
          assert(_req.isAuthenticated.calledWithExactly());
          assert(_res.redirect.calledWithExactly('/signin'));
        });

        it('isAuthenticated === true', function(){
          _req.isAuthenticated = sinon.stub().returns(true);
          _res.redirect = sinon.spy();

          auth_module.redirectAnonymous(_req, _res, next_spy);

          assert(next_spy.calledWithExactly());
          assert(_req.isAuthenticated.calledWithExactly());
          assert(!_res.redirect.called);
        });
    });
});
