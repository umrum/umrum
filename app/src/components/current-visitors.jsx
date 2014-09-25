/** @jsx React.DOM */

var CurrentVisitors = React.createClass({
  render: function() {
    var siteLink = "//" + this.props.siteHost;
    return (
      <div className="current-visitors">
        <div className="cv-heading">
          <p className="cv-counter">
            {this.props.currentVisitors}
          </p>
          <p>Current visitors</p>
        </div>
        <div className="cv-footer">
          <a href={siteLink}>
            <span>{this.props.siteHost}</span>
          </a>
        </div>
      </div>
    );
  }
});
