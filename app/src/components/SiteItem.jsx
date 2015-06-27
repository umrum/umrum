import React from "react";
import TrackingSnippet from "./TrackingSnippet";
import Router from "react-router";
let { Link } = Router;


export default class SiteItem extends React.Component {
  render() {
    let site = this.props.site;
    return (
      <div className="clearfix">
        <p className="col-md-6">
          <Link to="view" params={{host: site.host}}>
            { site.host }
          </Link>
        </p>
        <TrackingSnippet code={site.code} />
      </div>
    );
  }
}
