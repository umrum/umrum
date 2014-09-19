/** @jsx React.DOM */

var AddSiteForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var host = this.refs.host.getDOMNode().value.trim();
    if (!host) {
      return;
    }

    this.props.onSiteSubmit(host);
    this.refs.host.getDOMNode().value = '';
  },
  render: function() {
    return (
      <form className="panel-footer clearfix" onSubmit={this.handleSubmit}>
        <input type="text" className="col-sm-10" ref="host" />
        <button type="submit" className="btn-primary btn col-sm-2 btn-sm">Create new</button>
      </form>
    );
  }
});
