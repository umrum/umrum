import React from "react";

export default class IndexPage extends React.Component {
  componentWillMount() {
    console.log("[IndexPage] will mount with server response: ", this.props.data);
  }

  render() {
    return (
      <div id="index-page">
        <h1>IndexPage</h1>
      </div>
    );
  }
}
