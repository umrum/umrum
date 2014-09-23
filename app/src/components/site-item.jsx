/** @jsx React.DOM */

var React = React || require('react/addons');

var SiteItem = React.createClass({
  getInitialState: function() {
    return {
      site: {}
    };
  },
  render: function() {
    var href = "/dashboard/" + this.props.host;
    return (
      <div className="clearfix">
        <p className="site-item-host col-md-6">
          <a href={href}>
            { this.props.host }
          </a>
        </p>
        <p className="site-item-code col-md-6">
          { this.props.code }
        </p>
      </div>
    );
  }
});
