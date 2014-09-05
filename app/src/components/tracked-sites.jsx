/** @jsx React.DOM */

var TrackedSites = React.createClass({
  getInitialState: function() {
    return {
      sites: []
    }
  },
  render: function() {
    var siteItems = this.props.sites.map(function(site) {
      return (
        <SiteItem
          host={site.host}
          code={site.code}
        />
      )
    });
    return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title"><i className="fa fa-file-text-o"></i> Your sites</h3>
        </div>
        <div className="panel-body">
          {siteItems}
        </div>
        <div className="panel-footer announcement-bottom clearfix">
          <input type="text" className="new-site-host col-sm-10" />
          <button className="btn-primary btn add-site col-sm-2 btn-sm">Create new</button>
        </div>
      </div>
    )
  }
});
