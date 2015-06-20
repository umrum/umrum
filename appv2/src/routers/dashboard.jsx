import React from "react";
import { Route, DefaultRoute, RouteHandler, Link } from "react-router";

import IndexPage from "../pages/index";


export default class DashboardRouter extends React.Component {
  render() {
    return (
      <div id="main">
        <RouteHandler {...this.props} />
      </div>
    );
  }
}

DashboardRouter.getRoutes = function() {
  return (
    <Route name="dashboard" path="/" handler={DashboardRouter}>
      <DefaultRoute name="index" handler={IndexPage} />
    </Route>
  );
}
