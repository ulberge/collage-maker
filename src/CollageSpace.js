import React from 'react';

export default class CollageSpace extends React.PureComponent {

  render() {
    const { target } = this.props;
    return (
      <div>
        <img className="target" src={ target } alt="Target Image" onLoad={event => this.onLoad(event.target.src)} />
      </div>
    );
  }
}
