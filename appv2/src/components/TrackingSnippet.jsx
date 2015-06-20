import React from "react";


export default class TrackingSnippet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCode: false
    };
  }

  hideCode() {
    this.setState({showCode: false});
  }

  showCode() {
    this.setState({showCode: true});
  }

  getCode() {
    return [
      '!function(a,b,c,d){',
      '   b._mrm=b._mrm||{},',
      '   b._mrm.hostId=a,',
      '   d=c.createElement("script"),',
      '   d.async=1,',
      '   d.src="//umrum.io/dist/umrum-client.js"',
      '   c.body.appendChild(d);',
      ' }("' + this.props.code + '",window,document);'].join('\n');
  }

  render() {
    let code = this.getCode();
    let codeClass = 'tracking-snippet';
    codeClass += this.state.showCode ? ' visible-code' : ' invisible-code';

    return (
      <span className={codeClass}>
        <a href="#" onClick={() => this.showCode()} className="tracking-snippet-link">
          show tracking snippet
        </a>
        <div className="tracking-snippet-code">
          <span className="tracking-snippet-code-close" onClick={() => this.hideCode()}>x</span>
          <pre>
            {code}
          </pre>
        </div>
      </span>
    );
  }
}

