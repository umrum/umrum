var PageLoadTimeMeter = React.createClass({
  render: function() {
    return (
      <div className="page-load-time-meter">
        <i className="fa fa-clock-o"></i>
        <p><span className="pltm-counter">{this.props.pageLoadTime}</span> ms</p>
        <p>User</p>
      </div>
    )
  }
});
