/* global describe, it, beforeEach */

var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire');

describe('render-minified.js', function(){

    var resMock,
        renderSpy,
        renderNextSpy,
        htmlMinifierMock;

    beforeEach(function(){
        renderSpy = sinon.stub();
        renderNextSpy = sinon.stub();
        htmlMinifierMock = sinon.stub();
        resMock = {render: renderSpy, send: sinon.spy()};

        proxyquire('../../config/middlewares/render-minified', {
            'html-minifier': {minify: htmlMinifierMock, '@noCallThru': true}
        })({}, resMock, renderNextSpy);
    });

    it ('ensure response.render was overwritten by renderMinified module', function() {
        assert(renderSpy !== resMock.render);
        assert(renderSpy === resMock.oldRender);
        assert(renderNextSpy.calledOnce);
        assert(renderNextSpy.calledWithExactly());
    });

    it('ensure the new render function calls old one', function() {
        var a = "index.html",
            b = {foo: 'bar'};

        // calling new method
        resMock.render(a, b);

        // ensure old method is still called
        assert(renderSpy.calledOnce);
        assert(renderSpy.firstCall.args.length, 3);
        assert(renderSpy.calledWith(a, b));
    });

    it('ensure the minifier is called in oldRender callback', function() {
        var a = "index.html",
            b = {foo: 'bar'},
            html = sinon.spy(),
            minfiedHtml = sinon.spy();

        renderSpy.callsArgWith(2, undefined, html);
        htmlMinifierMock.returns(minfiedHtml);

        // calling new method
        resMock.render(a, b);

        // ensure html-minifier is called in callback
        assert(htmlMinifierMock.calledOnce);
        assert(htmlMinifierMock.calledWithExactly(html, {
            removeComments: true,
            removeCommentsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true
        }));

        // ensure res.send is called when callback is executed
        assert(resMock.send.calledOnce);
        assert(resMock.send.calledWithExactly(minfiedHtml));
    });
});
