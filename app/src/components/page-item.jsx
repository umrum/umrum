/** @jsx React.DOM */

var TopPageItem = React.createClass({
  render: function() {
    return (
      <p className="top-page-item">
        <span className="tpi-counter">{this.props.counter}</span>
        <span className="tpi-title">{this.props.url}</span>
      </p>
    )
  }
});
