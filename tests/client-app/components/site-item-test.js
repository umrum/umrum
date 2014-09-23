/** @jsx React.DOM */
jest.dontMock('../../../compiled_jsx/components/site-item.js');

describe('SiteItem', function() {
  it('The host and code is being used correctly', function() {
    var React = require('react/addons');
    var SiteItem = require('../../../compiled_jsx/components/site-item.js');
    var TestUtils = React.addons.TestUtils;

    var siteItem = TestUtils.renderIntoDocument(
      <SiteItem host="somehost.com" code="q1w2e3" />
    );

    var link = TestUtils.findRenderedDOMComponentWithClass(
      siteItem, 'site-item-host');

    expect(link.getDOMNode().textContent).toEqual('somehost.com');

    var siteCode = TestUtils.findRenderedDOMComponentWithClass(
      siteItem, 'site-item-code');
    expect(siteCode.getDOMNode().textContent).toEqual('q1w2e3');
  });
});

