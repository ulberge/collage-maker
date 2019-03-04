import React from 'react';
import ReactDOM from 'react-dom';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class LoadFile extends React.PureComponent {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    let sketch = p => {
      this.p = p;
    };

    new p5(sketch, node);
  }

  onLoad = (src) => {
    const { onLoad } = this.props;
    const imgEl = this.p.createImg(src).hide();
    const img = this.p.createGraphics(imgEl.elt.naturalWidth, imgEl.elt.naturalHeight);
    img.image(imgEl, 0, 0, imgEl.elt.naturalWidth, imgEl.elt.naturalHeight);
    img.loadPixels();
    onLoad(img);
  }

  render() {
    const { defaultImage } = this.props;
    return (
      <div className="upload" style={{ width: '100%', opacity: 1 }}>
        <img className="loadedImage" style={{ display: 'block' }} src={ defaultImage } alt="Load an image" onLoad={event => this.onLoad(event.target.src)} />
      </div>
    );
  }
}
