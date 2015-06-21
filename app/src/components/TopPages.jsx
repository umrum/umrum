import React from "react";
import TopPageItem from "./TopPages";


export default class TopPages extends React.Component {
  render() {
    let pages = this.props.topPages.map(function(page) {
      return <TopPageItem url={page.url} counter={page.counter} />
    });

    return (
      <div className="top-pages">
        <div className="tp-heading">
          <p className="tp-title"><i className="fa fa-file-text-o"></i> Top Pages</p>
        </div>
        <div className="tp-body">
          {pages}
        </div>
      </div>
    );
  }
}
