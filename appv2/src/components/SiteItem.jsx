import React from "react";
import TrackingSnippet from "./TrackingSnippet";


export default class SiteItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      site: {}
    };
  }

  render() {
    let href = "/dashboard/" + this.props.host;
    return (
      <div className="clearfix">
        <p className="col-md-6">
          <a href={href}>
            { this.props.host }
          </a>
        </p>
        <TrackingSnippet code={this.props.code} />
      </div>
    );
  }
}
