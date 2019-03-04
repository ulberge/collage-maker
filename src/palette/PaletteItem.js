import React from 'react';
import ReactDOM from "react-dom";

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class PaletteItem extends React.PureComponent {

  componentDidMount() {
    const { src } = this.props;

    // draw the src to a canvas
    // create masks of size same as src for each piece
    //
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
    const { piece, src, onPieceReady, selectionScale } = this.props;

    // if (p.width !== src.width || p.height !== src.height) {
    //   p.resizeCanvas(src.width, src.height);
    // }

    // Draw mask to graphics
    const mask = p.createGraphics(src.width, src.height);
    mask.background(255, 255, 255, 0);
    mask.fill(255, 255, 255, 255);
    mask.noStroke();
    mask.beginShape();

    const { minX, minY, maxX, maxY } = this.getBounds(piece.coords, src);
    // const alt = piece.coords.map(v => [v.x * src.width, v.y * src.height]);

    // coords.forEach(v => {
    //   mask.vertex(v[0], v[1]);
    // });
    piece.coords.forEach(v => {
      mask.vertex(v.x * src.width, v.y * src.width);
    });

    // console.log(coords, piece.coords, alt);


    mask.endShape(mask.CLOSE);

    // Filter image
    const toFilterG = p.createGraphics(src.width, src.height);
    toFilterG.image(src, 0, 0);
    const toFilter = toFilterG.get();
    toFilter.mask(mask);
    // toFilter.filter(p.POSTERIZE, 2);
    // toFilter.filter(p.GRAY);
    mask.remove();

    // Draw just the cutout
    // if (p.width !== piece.bounds.width * src.width || p.height !== piece.bounds.height * src.height) {
    //   p.resizeCanvas(piece.bounds.width * src.width, piece.bounds.height * src.height);
    // }
    // p.image(toFilter, -piece.bounds.left * src.width, -piece.bounds.top * src.height);

    const a = piece.coords[0].x-piece.coords[1].x;
    const b = piece.coords[0].y-piece.coords[1].y;
    const scale = Math.sqrt((a*a*src.width*src.width) + (b*b*src.width*src.width));
    if (p.width !== scale) {
      p.resizeCanvas(scale, scale * ((Math.sqrt(3)/6) + (Math.sqrt(3)/3)));
    }
    // if (p.width !== src.width || p.height !== src.height) {
    //   p.resizeCanvas(src.width, src.height);
    // }
    p.push();

    let xTot = 0;
    let yTot = 0;
    piece.coords.forEach(v => {
      xTot += v.x * src.width;
      yTot += v.y * src.width;
    });
    xTot = xTot / 3;
    yTot = yTot / 3;

    // const dist = Math.hypot(piece.coords[0].x-piece.coords[1].x, piece.coords[0].y-piece.coords[1].y);
    // console.log(xTot, yTot, minX, minY, maxX, maxY, selectionScale, dist, c);
    // console.log(piece.coords[0].x, piece.coords[1].x, piece.coords[0].y, piece.coords[1].y, c);
    // p.translate(-(selectionScale/2), -(selectionScale/2));
    // p.rotate(piece.r);
    p.translate(scale/2, scale * ((Math.sqrt(3)/3)));
    p.rotate(-(piece.r / 180) * Math.PI);
    p.image(toFilter, -xTot, -yTot);
    //p.image(toFilter, -minX, -minY);
    p.pop();
    // out.image(piece.image, -pieceSize / 2, -pieceSize / 2, pieceSize, pieceSize);


    onPieceReady(piece.id, p.canvas.toDataURL());
  }

  getBounds = (coords, src) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = 0;
    let maxY = 0;

    coords.forEach(v => {
      const x = v.x * src.width;
      const y = v.y * src.width;
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    });

    return { minX, minY, maxX, maxY };
  }

  // getCoords = (piece, src) => {
  //   const { x, y, r } = piece;
  //   const cx = x * src.width;
  //   const cy = y * src.height;
  //   const angleRadians = ((r / 180) * Math.PI) - (Math.PI / 2);
  //   const size = 100 * Math.sqrt(3) / 3;

  //   let minX = Infinity;
  //   let minY = Infinity;
  //   let maxX = 0;
  //   let maxY = 0;

  //   const coords = [];
  //   for (let i = 0; i < 3; i += 1) {
  //     const th = angleRadians + (i * (Math.PI * 2 / 3));
  //     const x = cx + (size * Math.cos(th));
  //     const y = cy + (size * Math.sin(th));

  //     if (x < minX) {
  //       minX = x;
  //     }
  //     if (y < minY) {
  //       minY = y;
  //     }
  //     if (x > maxX) {
  //       maxX = x;
  //     }
  //     if (y > maxY) {
  //       maxY = y;
  //     }
  //     coords.push([x, y]);
  //   }

  //   return { coords, minX, minY, maxX, maxY };
  // }

  render() {
    return (
      <div className="palette-item"></div>
    );
  }
}
