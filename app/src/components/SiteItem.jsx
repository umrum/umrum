import React from "react";
import TrackingSnippet from "./TrackingSnippet";
import Router from "react-router";
let { Link } = Router;


export default class SiteItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      site: {}
    };
  }

  render() {
    let data = this.props;
    return (
      <div className="clearfix">
        <p className="col-md-6">
          <Link to="view" params={{host: data.host}}>
            { data.host }
          </Link>
        </p>
        <TrackingSnippet code={data.code} />
      </div>
    );
  }
}
