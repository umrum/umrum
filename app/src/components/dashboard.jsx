var Dashboard = React.createClass({
  getInitialState: function() {
    return {
      currentVisitors: this.props.initialVisitors,
      topPages: this.props.initialTopPages,
      serverTime: this.props.initialServerTime,
      pageLoadTime: this.props.initialPageLoadTime
    }
  },
  componentDidMount: function() {
    // open socket IO
    var socket = io.connect('ws://' + window.location.host);
    socket.on(this.props.hostID, function (msg) {
      if (!msg) return;

      this.setState({
        currentVisitors: msg.currentVisits,
        topPages: msg.topPages,
        serverTime: msg.serverTime,
        pageLoadTime: msg.pageLoadTime
      });
    }.bind(this));
  },
  render: function() {
    return (
      <div className="dashboard-view">
        <CurrentVisitors siteHost={this.props.siteHost} currentVisitors={this.state.currentVisitors} />
        <div className="performance-metrics">
          <div className="pm-body">
            <ServerTimerMeter serverTime={this.state.serverTime} />
            <PageLoadTimeMeter pageLoadTime={this.state.pageLoadTime} />
          </div>
          <div className="pm-footer">
            Performance Metrics
          </div>
        </div>
        <TopPages topPages={this.state.topPages} />
      </div>
    )
  }
});
