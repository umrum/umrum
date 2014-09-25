/** @jsx React.DOM */

var Dashboard = React.createClass({
  getInitialState: function() {
    return {
      currentVisitors: this.props.initialVisitors,
      topPages: [],
      serverTime: 0,
      pageLoadTime: 0
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
      </div>
    )
  }
});
