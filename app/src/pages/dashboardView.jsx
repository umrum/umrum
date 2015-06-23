import React from "react";
import { URL_PREFIX } from "../../../config/env";
import { getData } from "../common/request";
import Dashboard from "../components/Dashboard";


export default class DashboardViewPage extends React.Component {
  componentWillMount() {
    console.log("[DashboardViewPage] will mount with server response: ", this.props.data.view);
  }

  render() {
    return (
      <div id="dashboard-page">
        <Dashboard {...this.props.data.view} />
      </div>
    );
  }

  static fetchData(params) {
    return getData(URL_PREFIX + "/api/dashboard/" + params.host);
  }
}
