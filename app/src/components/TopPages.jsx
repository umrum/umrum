import React from "react";
import TopPageItem from "./TopPageItem";


export default class TopPages extends React.Component {
  render() {
    return (
      <div className="top-pages">
        <div className="tp-heading">
          <p className="tp-title"><i className="fa fa-file-text-o"></i> Top Pages</p>
        </div>
        <div className="tp-body">
          {this.props.topPages.map(function(page) {
            return <TopPageItem key={page.url} page={page} />;
          })}
        </div>
      </div>
    );
  }
}
