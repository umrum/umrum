var TrackedSites = React.createClass({
  getInitialState: function() {
    return {
      sites: this.props.sites
    };
  },
  trackNewSite: function(host) {
    $.post('/dashboard/create', {host: host}, function(data){
      if ( data.code !== 200 ) {
        // TODO - Handler error
        console.error(data.error);
      } else {
        var siteList = this.state.sites;
        var newSiteList = siteList.concat(data.site);
        this.setState({sites: newSiteList});
      }
    }.bind(this));
  },
  render: function() {
    var siteItems = this.state.sites.map(function(site) {
      return (<SiteItem host={site.host} code={site.code} />);
    });
    return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title"><i className="fa fa-file-text-o"></i> Your sites</h3>
        </div>
        <div className="panel-body">
          {siteItems}
        </div>
        <AddSiteForm onSiteSubmit={this.trackNewSite} />
      </div>
    );
  }
});
