import React from 'react';
import ReactDOM from "react-dom";

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

import imageMoments from 'image-moments';

import Collage2 from './js/Collage2.js';

export default class Collage extends React.PureComponent {

  componentDidMount = () => {
    const { target, palette, numPiecesInRow } = this.props;
    const node = ReactDOM.findDOMNode(this);

    let testCollage;
    let testReference;

    const displayRatio = target.height / target.width;
    const displayW = 300;
    const displayH = displayW * displayRatio;

    const pieceSize = palette[0].width;

    const collageScale = displayW / (numPiecesInRow * pieceSize);

    const numPiecesInCol = Math.ceil(numPiecesInRow * displayRatio);

    let sketch = p => {
      this.p = p;

      p.setup = () => {
        const { palette } = this.props;
        //p.frameRate(2);
        p.createCanvas(displayW * 2, displayH);

        testCollage = p.createGraphics(displayW, displayH);
        testReference = p.createGraphics(displayW, displayH);

        testReference.image(target, 0, 0, displayW, displayH);
        testReference.filter(p.GRAY);

        //const refMat = this.createMatrix(testReference);
        const refMoments = null;//imageMoments(refMat);

        this.collage2 = new Collage2(numPiecesInRow, numPiecesInCol, (pieces) => {
          testCollage.background(200);
          this.drawPieces(testCollage, pieces, numPiecesInRow, collageScale);
          testCollage.filter(p.GRAY);

          // p.push();
          // p.tint(255, 200);
          // p.image(testReference, displayW, 0, displayW, displayH);
          // p.tint(255, 150);
          // p.image(testCollage, displayW, 0);
          // p.pop();

          const diff = this.compareGraphics(testCollage, testReference, refMoments);

          p.push();
          p.image(testReference, displayW, 0);
          p.pop();

          return diff;
        });
        this.collage2.start(palette);
      }

      p.draw = () => {
        p.background(200);

        const best = this.collage2.next();

        this.drawPieces(p, best, numPiecesInRow, collageScale);
      }
    };

    this.sketch = new p5(sketch, node);
  }

  componentDidUpdate = () => {
    if (this.collage2) {
      const { palette } = this.props;
      this.collage2.start(palette);
    }
  }

  compareGraphics = (test, ref, refMoments) => {
    test.loadPixels();
    ref.loadPixels();

    if (test.width !== ref.width || test.height !== ref.height) {
      console.log('graphics do not match size!');
      return null;
    }

    let diff = 0;
    for (let i = 0; i < test.pixels.length; i += 4) {
      const pC = test.pixels[i];
      const pR = ref.pixels[i];

      diff += (pC - pR)**2;
    }

    // image moments probably work best if we do grids of decreasing size
    //
    // const testMat = this.createMatrix(test);
    // const testMoments = imageMoments(testMat);
    // testMoments.m00 - refMoments.m00;
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

  drawPieces = (out, pieces, numPiecesInRow, piecesScale) => {
    if (!pieces.length) {
      return;
    }

    const pieceSize = pieces[0].image.width;

    let x = pieceSize / 2;
    let y = pieceSize / 2;
    let i = 1;

    pieces.forEach(piece => {
      if (i > numPiecesInRow) {
        y += pieceSize;
        x = pieceSize / 2;
        i = 1;
      }

      out.push();
      if (piecesScale) {
        out.scale(piecesScale);
      }
      out.translate(x, y);
      out.rotate(piece.r);
      out.image(piece.image, -pieceSize / 2, -pieceSize / 2, pieceSize, pieceSize);
      out.pop();

      x += pieceSize;
      i += 1;
    });
  }

  render() {
    return (
      <div></div>
    );
  }
}
