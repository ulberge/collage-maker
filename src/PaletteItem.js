import React from 'react';
import ReactDOM from "react-dom";

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class PaletteItem extends React.PureComponent {

  componentDidMount() {
    const { img } = this.props;
    const node = ReactDOM.findDOMNode(this);

    let sketch = p => {
      this.p = p;

      p.setup = () => {
        p.createCanvas(node.offsetWidth, node.offsetWidth);
        // p.background(100);
        p.noLoop();
        p.image(img, 0, 0, node.offsetWidth, node.offsetWidth);
      }
    };

    new p5(sketch, node);
  }

  render() {
    return (
      <div className="palette-item"></div>
    );
  }
}
