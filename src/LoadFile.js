import React from 'react';
import ReactDOM from "react-dom";
// import PropTypes from 'prop-types';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class LoadFile extends React.PureComponent {

  componentDidMount() {
    const { defaultFile } = this.props;
    const node = ReactDOM.findDOMNode(this);

    let sketch = p => {
      this.p = p;
      // p.setup = () => {
      //   const c = p.createCanvas(node.offsetWidth, node.offsetHeight);

      //   // On drop, load image, display and notify parent
      //   // c.drop(file => {
      //   //   if (file.type === 'image') {
      //   //     const currentImgEl = node.getElementsByTagName('img');
      //   //     if (currentImgEl && currentImgEl.length > 0) {
      //   //       node.removeChild(currentImgEl[0]);
      //   //     }

      //   //     const imgEl = p.createImg(file.data);
      //   //     p.resizeCanvas(node.offsetWidth, node.offsetHeight);
      //   //     this.onLoad(file.data);
      //   //   } else {
      //   //     console.log('Not an image file!');
      //   //   }
      //   // });

      //   p.fill(100);
      //   p.noStroke();
      //   p.textSize(16);
      //   p.textAlign(p.CENTER);
      //   p.text('Drag an image.', p.width / 2, p.height / 2);
      //   p.noLoop();
      // }
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
      <div className="upload" style={{ width: '100%' }}>
        <img className="loadedImage" src={ defaultImage } alt="Load an image" onLoad={event => this.onLoad(event.target.src)} />
      </div>
    );
  }
}
