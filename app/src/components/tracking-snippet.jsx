/** @jsx React.DOM */

var TrackingSnippet = React.createClass({
  getInitialState: function() {
    return {
      showCode: false
    };
  },
  hideCode: function() {
    this.setState({showCode: false});
  },
  showCode: function() {
    this.setState({showCode: true});
  },
  getCode: function() {
    return [
            '  !function(a,b,c,d){',
           '   b._mrm=b._mrm||{},',
           '   b._mrm.hostId=a,',
           '   d=c.createElement("script"),',
           '   d.async=1,',
           '   d.src="//umrum.io/dist/umrum-client.js"',
           '   c.body.appendChild(d);',
           ' }("' + this.props.code + '",window,document);'].join('\n');
  },
  render: function() {
    var code = this.getCode();
    var codeClass = 'tracking-snippet';
    codeClass += this.state.showCode ? ' visible-code' : ' invisible-code';
    return (
      <span className={codeClass}>
        <a href="#" onClick={this.showCode} className="tracking-snippet-link">
          Show tracking snippet
        </a>
        <div className="tracking-snippet-code">
          <span className="tracking-snippet-code-close" onClick={this.hideCode}>x</span>
          <pre>
            {code}
          </pre>
        </div>
      </span>
    );
  }
});
