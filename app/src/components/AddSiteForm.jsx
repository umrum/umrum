import React from "react";


export default class AddSiteForm extends React.Component {
  handleSubmit(e) {
    e.preventDefault();
    let host = this.refs.host.getDOMNode().value.trim();
    host = host.replace(/(.*?:\/\/)|(\/$)/g, "");
    if (!host) {
      return;
    }

    this.props.onSiteSubmit(host);
    this.refs.host.getDOMNode().value = '';
  }

  render() {
    return (
      <form className="panel-footer clearfix" onSubmit={this.handleSubmit.bind(this)}>
        <input type="text" className="col-sm-8" ref="host" />
        <button type="submit" className="btn-primary btn col-sm-3 btn-sm asf-button">+ Create new</button>
      </form>
    );
  }
}
