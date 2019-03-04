import React from 'react';
import ReactDOM from "react-dom";

import { fabric } from 'fabric';

export default class Overlay extends React.PureComponent {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    // Make canvas width and height of parent
    const container = node.parentNode.parentElement;
    this.w = container.clientWidth;
    this.h = container.clientHeight;
    this.scale = this.w;
    node.width = this.w;
    node.height = this.h;

    const { scale } = this.props;
    this.marginR = Math.sqrt(((scale * Math.sqrt(3) / 6)**2) + ((scale/2)**2));
    this.xMargin = this.marginR / this.scale;
    this.yMargin = this.marginR / this.scale;
    // console.log(this.xMargin, this.yMargin);

    this.canvas = new fabric.Canvas(node);
    this.canvas.on({
      'object:moving': this.cancelUpdate,
      'object:rotating': this.cancelUpdate,
      'object:moved': this.updatePieces,
      'object:rotated': this.updatePieces,
      'selection:updated': this.queueUpdate,
      'mouse:up': this.doQueue
    });
    this.canvas.selection = false;

    this.renderPieces();

    document.body.addEventListener('keydown', e => {
      if (e.key === 'a') {
        this.addRandomTriangle();
      }

      if (e.key === 's') {
        const image = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

        window.location.href = image; // it will save locally

        setTimeout(() => {
          const render = document.querySelector('#render .lower-canvas').toDataURL("image/png").replace("image/png", "image/octet-stream");
          window.location.href = render; // it will save locally
          window.prompt("Copy to clipboard: Ctrl+C, Enter", localStorage.getItem('collageMakerState'));
        }, 1);
      }
    });
  }

  componentDidUpdate() {
    this.canvas.clear();
    this.renderPieces();
  }

  // onMove = options => {
  //   options.target.setCoords();
  //   this.triangles.forEach(triangle => {
  //     if (triangle === options.target) return;
  //     const intersects = options.target.intersectsWithObject(triangle);
  //     console.log(intersects);
  //     triangle.set('fill', intersects ? 'rgba(255,0,0,0.5)' : 'rgba(255,255,255,0.5)');
  //   })
  // }

  queueUpdate = options => {
    console.log('queue update');
    this.updateDelayed = () => this.updatePieces(options);
  }

  doQueue = () => {
    if (this.updateDelayed) {
      console.log('do queue');
      this.updateDelayed();
    }
  }

  cancelUpdate = () => {
    console.log('dont update!');
    this.updateDelayed = false;
  }

  updatePieces = options => {
    this.cancelUpdate();
    const { onUpdatePieces } = this.props;

    // create pieces from triangles
    let pieces = [];
    if (this.triangles) {
      pieces = this.triangles.map(triangle => {
        const { _collage_id, left, top, angle, oCoords, _dirty } = triangle;

        // Normalize
        const { mt, bl, br } = oCoords;
        const nCoords = [
          { x: mt.x / this.scale, y: mt.y / this.scale },
          { x: bl.x / this.scale, y: bl.y / this.scale },
          { x: br.x / this.scale, y: br.y / this.scale },
        ];

        const bounds = triangle.getBoundingRect();
        const nBounds = {
          left: bounds.left / this.scale,
          top: bounds.top / this.scale,
          width: bounds.width / this.scale,
          height: bounds.height / this.scale
        };

        let selected = false;
        let dirty = _dirty;
        if (options && options.target === triangle) {
          selected = true;
          dirty = true;
        }

        return {
          selected: selected,
          id: _collage_id,
          x: left / this.scale,
          y: top / this.scale,
          r: angle,
          coords: nCoords,
          bounds: nBounds,
          dirty
        };
      });
    }
    onUpdatePieces(pieces);
  }

  renderPieces = () => {
    const { pieces, placedPiecesData, scale } = this.props;

    this.triangles = pieces.map(piece => this.createTriangle(piece));
    this.triangles.forEach(t => this.canvas.add(t));

    // Set selected
    for (let i = 0; i < pieces.length; i += 1) {
      if (pieces[i].selected) {
        this.canvas.setActiveObject(this.triangles[i]);
      }
    }

    // console.log('check overlaps');
    pieces.forEach(piece => {
      const { id, r, coords } = piece;

      if (!placedPiecesData[id]) {
        return;
      }

      const placedPiece = placedPiecesData[id];
      const { overlaps } = placedPiece;
      if (overlaps && Object.keys(overlaps).length > 0) {
        Object.keys(overlaps).forEach(overlapKey => {
          const overlapShape = overlaps[overlapKey];
          //const overlapShape = [{x: 20, y: 20}, {x: 20, y: 100}, {x: 100, y: 100}];
          // console.log(id, ' overlapped by ', overlapKey, overlapShape);

          const topTip = coords[0];

          const ptsAbsolute = [];
          overlapShape.forEach(vPolar => {
            const { dist, angle } = vPolar;
            const angleAdj = ((r / 180) * Math.PI) + angle;
            const x = (Math.cos(angleAdj) * dist) * scale;
            const y = (Math.sin(angleAdj) * dist) * scale;
            ptsAbsolute.push({ x: x + (topTip.x * this.scale), y: y + (topTip.y * this.scale) });
          });

          // get min and max of abs
          let minX = Infinity;
          let minY = Infinity;
          ptsAbsolute.forEach(pt => {
            if (pt.x < minX) {
              minX = pt.x;
            }
            if (pt.y < minY) {
              minY = pt.y;
            }
          });
          // console.log(ptsAbsolute, topTip.x, topTip.y);

          const polygon = new fabric.Polygon(ptsAbsolute, {
            left: minX,
            top: minY,
            stroke: 'rgba(0,0,0,0.9)',
            strokeWidth: 0,
            fill: 'rgba(255,0,0,0.2)',
            selectable: false,
            objectCaching: false,
          });
          this.canvas.add(polygon);
        });
      }
    });
  }

  createTriangle = piece => {
    const { scale } = this.props;
    const { x, y, r } = piece;

    const triangle = new fabric.Triangle({
      width: scale,
      height: scale * ((Math.sqrt(3)/6) + (Math.sqrt(3)/3)),
      left: x * this.scale,
      top: y * this.scale,
      originY: 'center',
      originX: 'center',
      stroke: 'rgba(0,0,0,0.9)',
      strokeWidth: 0.5,
      fill: 'rgba(255,255,255,0.2)',
      // strokeWidth: 0,
      // fill: 'rgba(0,255,0,0.2)',
      transparentCorners: false,
      padding: 0,
      cornerSize: 15,
      cornerColor: 'rgba(255,0,200,0.7)',
      borderColor: 'rgba(255,0,200,0.5)',
    });
    triangle.setControlVisible('bl', false);
    triangle.setControlVisible('br', false);
    triangle.setControlVisible('mb', false);
    triangle.setControlVisible('ml', false);
    triangle.setControlVisible('mr', false);
    triangle.setControlVisible('mt', false);
    triangle.setControlVisible('tl', false);
    triangle.setControlVisible('tr', false);
    triangle._collage_id = piece.id;
    triangle.rotate(r);

    return triangle;
  }

  // Add random triangle
  addRandomTriangle = () => {
    const { pieces, addPiece } = this.props;

    const triangle = this.getNonIntersectingRandomTriangle(pieces);

    if (triangle) {
      triangle._dirty = true;
      this.triangles.push(triangle);
      this.canvas.add(triangle);
      this.updatePieces();
      addPiece(triangle._collage_id);
    }
  }

  getNonIntersectingRandomTriangle = pieces => {
    const limit = 1000;
    for (let i = 0; i < limit; i += 1) {
      const newPiece = this.getRandomTriangle();
      const newTriangle = this.createTriangle(newPiece);
      const intersects = this.triangles.filter(triangle => triangle.intersectsWithObject(newTriangle));
      if (intersects.length === 0) {
        return newTriangle;
      }
    }

    console.log('cannot find openings for new piece');
    return null;
  }

  getRandomTriangle = () => {
    const r = Math.random() * 360;

    const x = (Math.random() * (1 - (this.xMargin * 2))) + this.xMargin;
    // regularize to 0-1/ratio with width not 0-1
    const y = ((Math.random() * (1 - (this.yMargin * 2))) + this.yMargin) * (this.h / this.w);
    const id = this.nextID();

    return { id, x, y, r };
  }

  nextID = () => {
    let id = parseInt(localStorage.getItem('pieceID'));
    if (!id) {
      id = 0;
    }
    localStorage.setItem('pieceID', id + 1);
    return id;
  }

  onMove = options => {
    // const lastCenter = options.target.getCenterPoint();
    // options.target.setCoords();
    // const newCenter = options.target.getCenterPoint();
    // console.log(lastCenter, newCenter);

    // let allowUpdate = true;
    // this.walls.forEach(obj => {
    //   const intersects = options.target.intersectsWithObject(obj);
    //   if (intersects) {
    //     allowUpdate = false;
    //   }
    // });

    // console.log(allowUpdate);
    // if (!allowUpdate){
    //   options.target.setPositionByOrigin(lastCenter);
    // }
    // options.target.setCoords();
    // this.canvas.forEachObject(triangle => {
    //   if (triangle === options.target) return;
    //   const intersects = options.target.intersectsWithObject(triangle);
    //   if (intersects) {
    //     console.log('intersects!');
    //   }
    //   triangle.set('opacity', intersects ? 0.5 : 1);
    // });

    // Sets corner position coordinates based on current angle, width and height
    // options.target.setCoords();

    // const bounds = options.target.getBoundingRect();
    // const center = options.target.getCenterPoint();

    // let adjustedCenter = center;
    // // Don't allow objects off the canvas
    // if(bounds.left < 0) {
    //   adjustedCenter.x = center.x - bounds.left;
    // }

    // if(bounds.top < 0) {
    //   adjustedCenter.y = center.y - bounds.top;
    // }

    // const right = bounds.left + bounds.width;
    // if(right > this.w) {
    //   adjustedCenter.x = center.x - (right - this.w);
    // }

    // const bottom = bounds.top + bounds.height;
    // if(bottom > this.h) {
    //   adjustedCenter.y = center.y - (bottom - this.h);
    // }

    // options.target.setPositionByOrigin(adjustedCenter);
  }

  render() {
    return (
      <canvas width="300" height="300"></canvas>
    );
  }
}
