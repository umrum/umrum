/** @jsx React.DOM */

var SiteItem = React.createClass({
  getInitialState: function() {
    return {
      site: {}
    };
  },
  render: function() {
    return (
      <div className="clearfix">
        <p className="col-md-6">
          <a href="#">
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
