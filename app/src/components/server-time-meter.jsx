var ServerTimerMeter = React.createClass({
  render: function() {
    return (
      <div className="server-time-meter">
        <i className="fa fa-clock-o"></i>
        <p><span className="stm-counter">{this.props.serverTime}</span> ms</p>
        <p>Server</p>
      </div>
    )
  }
});
