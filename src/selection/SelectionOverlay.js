import React from 'react';
import ReactDOM from "react-dom";

import { fabric } from 'fabric';

export default class SelectionOverlay extends React.PureComponent {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    // Make canvas width and height of parent
    const container = node.parentNode.parentElement;
    this.w = container.clientWidth;
    this.h = container.clientHeight;
    this.ratio = this.h / this.w;
    this.scale = this.w;
    node.width = this.w;
    node.height = this.h;

    this.canvas = new fabric.Canvas(node);
    this.canvas.on({
      'object:moving': this.cancelUpdate,
      'object:rotating': this.cancelUpdate,
      'object:moved': this.updatePieces,
      'object:rotated': this.updatePieces,
      'selection:updated': this.queueUpdate,
      'mouse:up': this.doQueue,
      'mouse:down': this.onMouseDown
    });
    this.canvas.selection = false;

    window.addEventListener('resize', this.onWindowResize, false);

    this.renderPieces();
  }

  componentDidUpdate() {
    this.canvas.clear();
    this.renderPieces();
  }

  queueUpdate = options => {
    this.updateDelayed = () => this.updatePieces(options);
  }

  onMouseDown = options => {
    if (options.target === null) {
      this.addTriangleAt(options.pointer);
    }
  }

  doQueue = () => {
    if (this.updateDelayed) {
      this.updateDelayed();
    }
  }

  cancelUpdate = () => {
    this.updateDelayed = false;
  }

  updatePieces = options => {
    this.cancelUpdate();
    const { onUpdatePieces } = this.props;

    // create pieces from triangles
    let pieces = [];
    if (this.triangles) {
      pieces = this.triangles.map(triangle => {
        const { _collage_id, left, top, angle, oCoords, _dirty, _selected } = triangle;

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
        } else {
          selected = _selected;
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
    const { pieces } = this.props;

    this.triangles = pieces.map(piece => this.createTriangle(piece));
    this.triangles.forEach(t => this.canvas.add(t));

    // Set selected
    for (let i = 0; i < pieces.length; i += 1) {
      if (pieces[i].selected) {
        this.canvas.setActiveObject(this.triangles[i]);
      }
    }

    this.renderOverlaps();
  }

  renderOverlaps = () => {
    const { pieces, placedPiecesData, scale } = this.props;

    pieces.forEach(piece => {
      const { id, r, coords } = piece;

      // If not placed, it cant have overlaps
      if (!placedPiecesData[id]) {
        return;
      }

      const placedPiece = placedPiecesData[id];
      const { overlaps } = placedPiece;
      if (!overlaps) {
        return;
      }

      // For each overlap, draw the section on this triangle
      Object.keys(overlaps).forEach(overlapKey => {
        const overlapShape = overlaps[overlapKey];
        // Polar coordinates of overlay are relative to top tip of triangle
        const topTip = coords[0];
        console.log(overlapShape);

        // Get the polar coordinates as points relative to the size of this overlay at the rotation of the parent piece
        const ptsAbsolute = [];
        overlapShape.forEach(vPolar => {
          const { dist, angle } = vPolar;
          const angleAdj = ((r / 180) * Math.PI) + angle;
          const x = (Math.cos(angleAdj) * dist) * scale * this.scale;
          const y = (Math.sin(angleAdj) * dist) * scale * this.scale;
          ptsAbsolute.push({ x: x + (topTip.x * this.scale), y: y + (topTip.y * this.scale) });
        });
        console.log('ptsAbsolute', ptsAbsolute);

        // Get the min and max of the points for translation since fabricjs translates to origin
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
        console.log('minY, minX', minY, minX);

        // Move back to correct position
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
    });
  }

  addTriangleAt = click => {
    const id = this.nextID();
    const r = 0;
    const x = click.x / this.scale;
    const y = click.y / this.scale;
    const piece = { id, x, y, r };
    const newTriangle = this.createTriangle(piece);
    this.addTriangle(newTriangle);
  }

  createTriangle = piece => {
    const { scale } = this.props;
    const { x, y, r } = piece;

    const triangle = new fabric.Triangle({
      width: scale * this.scale,
      height: scale * ((Math.sqrt(3)/6) + (Math.sqrt(3)/3)) * this.scale,
      left: x * this.scale,
      top: y * this.scale,
      originY: 'center',
      originX: 'center',
      stroke: 'rgba(0,0,0,0.9)',
      strokeWidth: 0.5,
      fill: 'rgba(255,255,255,0.2)',
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

  addTriangle = triangle => {
    const { addPiece } = this.props;
    if (triangle) {
      triangle._dirty = true;
      triangle._selected = true;
      this.triangles.push(triangle);
      this.canvas.add(triangle);
      this.updatePieces();
      addPiece(triangle._collage_id);
    }
  }

  // Get unique IDs for each piece
  nextID = () => {
    let id = parseInt(localStorage.getItem('pieceID'));
    if (!id) {
      id = 0;
    }
    localStorage.setItem('pieceID', id + 1);
    return id;
  }

  onWindowResize = () => {
    const node = ReactDOM.findDOMNode(this);
    const container = node.parentNode.parentElement;
    this.w = container.clientWidth;
    this.scale = this.w;
    this.canvas.clear();
    this.canvas.setWidth(this.w);
    this.canvas.setHeight(this.w * this.ratio);
    this.renderPieces();
  }

  render() {
    return (
      <canvas width="300" height="300"></canvas>
    );
  }
}
