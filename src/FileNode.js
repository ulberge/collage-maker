import React from 'react';
import ReactDOM from 'react-dom';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class FileNode extends React.PureComponent {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    let sketch = p => {
      this.p = p;
    };
    new p5(sketch, node);
  }

  onLoad = (src) => {
    const { onFinished } = this.props;
    const imgEl = this.p.createImg(src).hide();
    const img = this.p.createGraphics(imgEl.elt.naturalWidth, imgEl.elt.naturalHeight);
    img.image(imgEl, 0, 0, imgEl.elt.naturalWidth, imgEl.elt.naturalHeight);
    img.loadPixels();
    onFinished(img);
  }

  render() {
    const { inputs } = this.props;
    const { src } = inputs;
    return (
      <div className="upload" style={{ width: '100%' }}>
        <img className="loadedImage" src={ src } alt="Load an image" onLoad={event => this.onLoad(event.target.src)} />
      </div>
    );
  }
}
