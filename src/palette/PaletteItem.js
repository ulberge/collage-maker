import React from 'react';
import ReactDOM from "react-dom";

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class PaletteItem extends React.PureComponent {

  componentDidMount() {
    const { src } = this.props;

    if (!src) {
      return;
    }

    const node = ReactDOM.findDOMNode(this);
    let sketch = p => {
      this.p = p;
      p.setup = () => this.setup(p);
      p.draw = () => this.draw(p);
    };
    this.sketch = new p5(sketch, node);
  }

  componentDidUpdate() {
    const { piece } = this.props;
    if (this.p && piece.dirty) {
      // Update palette Item
      this.draw(this.p);
    }
  }

  setup = p => {
    p.createCanvas(100, 100);
    p.noLoop();
  }

  draw = p => {
    const { piece, src, onPieceReady } = this.props;

    // Draw mask to graphics
    const mask = p.createGraphics(src.width, src.height);
    mask.background(255, 255, 255, 0);
    mask.fill(255, 255, 255, 255);
    mask.noStroke();
    mask.beginShape();
    piece.coords.forEach(v => {
      mask.vertex(v.x * src.width, v.y * src.width);
    });
    mask.endShape(mask.CLOSE);

    // Filter image
    const toFilterG = p.createGraphics(src.width, src.height);
    toFilterG.image(src, 0, 0);
    const toFilter = toFilterG.get();
    toFilter.mask(mask);
    mask.remove();

    // Draw just the cutout
    const a = piece.coords[0].x-piece.coords[1].x;
    const b = piece.coords[0].y-piece.coords[1].y;
    const scale = Math.sqrt((a*a*src.width*src.width) + (b*b*src.width*src.width));
    if (p.width !== scale) {
      p.resizeCanvas(scale, scale * ((Math.sqrt(3)/6) + (Math.sqrt(3)/3)));
    }
    p.push();

    // Get center point
    let xTot = 0;
    let yTot = 0;
    piece.coords.forEach(v => {
      xTot += v.x * src.width;
      yTot += v.y * src.width;
    });
    xTot = xTot / 3;
    yTot = yTot / 3;

    // Rotate to face up around center point
    p.translate(scale/2, scale * ((Math.sqrt(3)/3)));
    p.rotate(-(piece.r / 180) * Math.PI);
    p.image(toFilter, -xTot, -yTot);
    p.pop();

    onPieceReady(piece.id, p.canvas.toDataURL());
  }

  render() {
    return (
      <div className="palette-item"></div>
    );
  }
}
