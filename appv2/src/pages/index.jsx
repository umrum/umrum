import React from "react";
import { URL_PREFIX } from "../../../config/env";
import { getData } from "../common/request";
import TrackedSites from "../components/TrackedSites";

export default class IndexPage extends React.Component {
  componentWillMount() {
    console.log("[IndexPage] will mount with server response: ", this.props.data.index);
  }

  render() {
    let sites = this.props.data.index;
    return (
      <div id="index-page">
        <TrackedSites sites={sites} />
      </div>
    );
  }
}

IndexPage.fetchData = function(params) {
  return getData(URL_PREFIX + "/api/sites");
}
