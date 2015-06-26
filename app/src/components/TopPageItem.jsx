import React from "react";


export default class TopPageItem extends React.Component {
  render() {
    return (
      <p className="top-page-item">
        <span className="tpi-counter">{this.props.page.counter}</span>
        <span className="tpi-title">{this.props.page.url}</span>
      </p>
    );
  }
}

