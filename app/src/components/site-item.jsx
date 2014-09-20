/** @jsx React.DOM */

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
        <p className="col-md-6">
          <a href={href}>
            { this.props.host }
          </a>
        </p>
        <p className="col-md-6">
          { this.props.code }
        </p>
      </div>
    );
  }
});
