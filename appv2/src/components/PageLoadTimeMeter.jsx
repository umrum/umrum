import React from "react";


export default class PageLoadTimeMeter extends React.Component {
  render() {
    return (
      <div className="page-load-time-meter">
        <i className="fa fa-clock-o"></i>
        <p><span className="pltm-counter">{this.props.pageLoadTime}</span> ms</p>
        <p>User</p>
      </div>
    )
  }
}
