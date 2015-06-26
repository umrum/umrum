import React from "react";
import CurrentVisitors from "./CurrentVisitors";
import ServerTimerMeter from "./ServerTimeMeter";
import PageLoadTimeMeter from "./PageLoadTimeMeter";
import TopPages from "./TopPages";


export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentVisitors: 0,
      topPages: [],
      serverTime: 0,
      pageLoadTime: 0
    }
  }

  componentDidMount() {
    // open socket IO
    let socket = io.connect('ws://' + window.location.host);
    socket.on(this.props.hostId, function (msg) {
      if (!msg) return;

      this.setState({
        currentVisitors: msg.currentVisits,
        topPages: msg.topPages,
        serverTime: msg.serverTime,
        pageLoadTime: msg.pageLoadTime
      });
    }.bind(this));
  }

  render() {
    return (
      <div className="dashboard-view">
        <CurrentVisitors siteHost={this.props.host} currentVisitors={this.state.currentVisitors} />
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
}
