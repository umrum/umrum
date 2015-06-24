import React from "react";
import { Route, DefaultRoute, RouteHandler, Link } from "react-router";

import IndexPage from "../pages/index";
import DashboardViewPage from "../pages/dashboardView";


export default class DashboardRouter extends React.Component {
  render() {
    return (
      <div className="wrap">
        <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link to="index" className="navbar-brand  umrum-logo">
              UMRUM
            </Link>
          </div>

          <div className="collapse navbar-collapse navbar-ex1-collapse">
            <ul className="nav navbar-nav side-nav">
              <li className="active">
                <Link to="index">
                  <i className="fa fa-dashboard"></i> Dashboard
                </Link>
              </li>
            </ul>

            <ul className="nav navbar-nav navbar-right navbar-user">
              <li className="dropdown user-dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown"><i className="fa fa-user"></i> {this.props.name} </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="page-wrap">
          <RouteHandler {...this.props} />
        </div>
      </div>
    );
  }

  static getRoutes() {
    return (
      <Route name="dashboard" path="/" handler={DashboardRouter}>
        <DefaultRoute name="index" handler={IndexPage} />
        <Route name="view" path=":host" handler={DashboardViewPage} />
      </Route>
    );
  }
}
