import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class Processor extends React.PureComponent {
  // props: input + onFinished(output)
  static propTypes = {
    inputs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onFinished: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  componentDidMount = () => {
    this.createSketch();
  }

  createSketch = () => {
    const { inputs } = this.props;
    const node = ReactDOM.findDOMNode(this);

    let testGraphics;
    let current = null;
    let best = null;
    let bestScore = Infinity;
    this.pieceSize = 20;

    let refMat;
    let refMoments;

    let sketch = p => {
      p.setup = () => {
        // p.frameRate(1);
        p.createCanvas(source.width, source.height);
        testGraphics = p.createGraphics(source.width, source.height);
        testGraphics.image(target, 0, 0, source.width, source.height);
        testGraphics.filter(p.GRAY);

        refMat = this.createMatrix(testGraphics);
        refMoments = imageMoments(refMat);
      }

      p.draw = () => {
        const { source } = this.props;

        if (source) {
          p.image(source, 0, 0);
          const toFilter = p.get();
          p.background(255);

          const mask = p.createGraphics(source.width, source.height);
          const tile = p.createGraphics(source.width, source.height);

          this.makeTile(mask, toFilter, tile);

          if (best) {
            p.image(best, 0, 0);
          }
          const x = (Math.random() * mask.width) - (this.pieceSize / 2);
          const y = (Math.random() * mask.height) - (this.pieceSize / 2);
          p.image(tile, x, y);
          // p.image(target, 1, 1, source.width, source.height);
          // p.image(mask, x, y);

          // if score is better, make this image the current
          current = p.get();
          current.filter(p.GRAY);

          // p.image(current, 0, 0);
          const score = this.compareGraphics(current, testGraphics, refMat, refMoments);
          console.log(bestScore, score);
          if (score < bestScore) {
            best = p.get();
            bestScore = score;
          }

          mask.remove();
          tile.remove();
        }
      }
    };

    this.sketch = new p5(sketch, node);
  }

  // returns a graphics object with a tile in the corner
  makeTile = (mask, source, tile) => {
    const bounds = [];

    const len = this.pieceSize;
    const s_th = Math.random() * Math.PI * 2;
    const c_x = (Math.random() * (mask.width - (2 * len))) + len;
    const c_y = (Math.random() * (mask.height - (2 * len))) + len;

    let minX = Infinity;
    let minY = Infinity;
    for (let i = 0; i < 3; i += 1) {
      const th = s_th + (i * (Math.PI * 2 / 3));
      const x = c_x + (len * Math.cos(th));
      const y = c_y + (len * Math.sin(th));

      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      bounds.push([x, y]);
    }

    this.drawToMask(mask, bounds);
    source.mask(mask);

    tile.image(source, -minX, -minY);
  }

  drawToMask = (mg, bounds) => {
    mg.background(255, 255, 255, 0);
    mg.fill(255, 255, 255, 255);
    mg.noStroke();

    mg.beginShape();
    bounds.forEach(v => {
      mg.vertex(v[0], v[1]);
    });
    mg.endShape(mg.CLOSE);
  }

  compareGraphics = (curr, test, refMat, refMoments) => {
    curr.loadPixels();
    test.loadPixels();

    if (curr.width !== test.width || curr.height !== test.height) {
      console.log('graphics do not match size!');
      return null;
    }

    let diff = 0;
    for (let i = 0; i < curr.pixels.length; i += 4) {
      const pC = curr.pixels[i];
      const pR = test.pixels[i];

      // if (pC === 0 || pR === 0) {
      //   diff += 255**2;
      // } else {

      // }
      diff += (pC - pR)**2;
    }

    // image moments probably work best if we do grids of decreasing size
    //
    // const currMat = this.createMatrix(curr);
    // const currMoments = imageMoments(currMat);

    // const H = m => -Math.sign(m) * Math.log(Math.abs(m));

    // //const keys = ['hu1', 'hu2', 'hu3', 'hu4', 'hu5', 'hu6', 'hu7'];//, 'hu8'];
    // const keys = ['mu00', 'mu11', 'mu20', 'mu21', 'mu12', 'mu30', 'mu03'];//, 'hu8'];

    // // https://www.learnopencv.com/shape-matching-using-hu-moments-c-python/
    // let total = 0;
    // keys.forEach(key => {
    //   const cm = H(currMoments[key]);
    //   const rm = H(refMoments[key]);
    //   const diff = Math.abs(cm - rm);
    //   console.log(key, cm, rm, diff);
    //   total += diff;
    // });

    // return total;
    return diff;
  }

  createMatrix = (g) => {
    g.loadPixels();
    const mat = [];
    for (let y = 0; y < g.height; y += 1) {
      const row = [];
      const offset = y * g.width;
      for (let x = 0; x < g.width; x += 1) {
        row.push(g.pixels[(offset + x) * 4]);
      }
      mat.push(row);
    }
    return mat;
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
      </div>
    );
  }
}
