import React from 'react';
import ReactDOM from 'react-dom';

import { fabric } from 'fabric';

export default class Overlay extends React.Component {
  // pieces={pieces}
  // processedPieces={processedPieces}
  // src={src}

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    const { savedPiecesData } = this.props;

    this.placedPiecesData = {};
    if (savedPiecesData) {
      this.placedPiecesData = savedPiecesData;
    }
    this.order = [];

    // Make canvas width and height of parent
    const container = node.parentNode.parentElement;
    this.w = container.clientWidth;
    this.h = container.clientHeight;
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
      'mouse:up': this.doQueue
    });
    this.canvas.selection = false;

    this.renderPieces();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { pieces, placedPieces, processedPieces, scale } = this.props;

    if (!nextProps || !nextState) {
      return true;
    }

    // if the placedPieces are the same
    if (placedPieces.length !== nextProps.placedPieces.length) {
      return true;
    }

    pieces.forEach((piece, i) => {
      const { id, selected } = piece;

      const { dataURL } = processedPieces[id];
      // if the dataURLS are the same
      if (dataURL !== nextProps.processedPieces[id].dataURL) {
        return true;
      }

      // if selection is not the same
      if (selected !== nextProps.pieces[i].selected) {
        return true;
      }
    });

    // if the scale is the same
    if (scale !== nextProps.scale) {
      return true;
    }

    return true;
  }


  componentDidUpdate() {
    this.canvas.clear();
    // keep track to prevent old async renders from still happening
    if (this.currentRenderIndex === undefined) {
      this.currentRenderIndex = -1;
    }
    this.currentRenderIndex += 1;
    this.renderPieces(this.currentRenderIndex);
  }

  checkOverlap = options => {
    // check if there is an edge of any other triangle near it
    // if (Math.round(options.target.left / grid * 4) % 4 == 0 &&
    //   Math.round(options.target.top / grid * 4) % 4 == 0) {
    //   options.target.set({
    //     left: Math.round(options.target.left / grid) * grid,
    //     top: Math.round(options.target.top / grid) * grid
    //   }).setCoords();
    // }
    options.target.setCoords();
    // const targetPiece = pieces[id];
    const targetCoords = this.getCoords(options.target);
    options.target.overlaps = {};
    this.canvas.forEachObject((obj) => {
      if (obj === options.target) return;
      if (!obj.overlaps) {
        obj.overlaps = [];
      }

      const otherCoords = this.getCoords(obj);

      // if (this.triangle2triangleHasOverlap(targetCoords, otherCoords)) {
      //   if (!obj.overlaps.includes(id)) {
      //     obj.overlaps.push(id);
      //   }
      // } else {
      //   const i = obj.overlaps.indexOf(id);
      //   if (i > -1) {
      //     // remove
      //     obj.overlaps.splice(i, 1);
      //   }
      // }

      const overlap = this.triangle2triangleIntersection(targetCoords, otherCoords, obj.angle);
      if (overlap) {
        obj.overlaps[options.target._collage_id] = overlap;
      } else if (obj.overlaps[options.target._collage_id] !== undefined) {
        delete obj.overlaps[options.target._collage_id];
      }
    });
  }

  getCoords = triangle => {
    const { mt, bl, br } = triangle.oCoords;
    const nCoords = [
      { x: mt.x, y: mt.y },
      { x: bl.x, y: bl.y },
      { x: br.x, y: br.y },
    ];
    return nCoords;
  }

  renderPieces = renderIndex => {
    const { pieces, processedPieces, placedPieces } = this.props;

    this.triangles = [];
    pieces.forEach(piece => {
      const { id } = piece;
      // Not processed or placed
      if (!processedPieces[id] || !placedPieces.includes(id)) {
        return
      }

      const { dataURL } = processedPieces[id];
      // Set to defaults unless we have created data for it
      const { x, y, r, overlaps } = this.placedPiecesData[id] ? this.placedPiecesData[id] : { x: 0.5, y: 0.5, r: 0, overlaps: {} };

      this.createTriangle(id, x, y, r, overlaps, dataURL, triangle => {
        if (this.currentRenderIndex !== renderIndex) {
          // delayed async call, dont do
          return;
        }
        this.canvas.add(triangle);
        this.triangles.push(triangle);
        // triangle.set('opacity', triangle.overlaps && Object.keys(triangle.overlaps).length > 0 ? 0.6 : 1);
        // triangle.set('cornerSize', triangle.overlaps && Object.keys(triangle.overlaps).length > 0 ? 25 : 15);

        // Set selected
        if (piece.selected) {
          // console.log('select', piece.id);
          this.canvas.setActiveObject(triangle);
        }
      });
    });
  }

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

  // On update, record data, send to parent
  updatePieces = options => {
    this.cancelUpdate();
    this.checkOverlap(options);
    const { onPiecePlacedUpdate, onSelectPiece } = this.props;

    let placedPiecesData = {};
    if (this.triangles) {
      this.triangles.forEach(triangle => {
        const { _collage_id, left, top, angle, overlaps } = triangle;

        placedPiecesData[_collage_id] = {
          x: left / this.scale,
          y: top / this.scale,
          r: angle,
          overlaps
        };

        if (options && options.target === triangle) {
          onSelectPiece(_collage_id);
        }
      });
    }
    this.placedPiecesData = placedPiecesData;
    onPiecePlacedUpdate(placedPiecesData);
  }

  createTriangle = (id, x, y, r, overlaps, dataURL, callback) => {
    const { scale } = this.props;

    fabric.Image.fromURL(dataURL, triangle => {
      triangle.scale(scale / 20).set({
        left: x * this.scale,
        top: y * this.scale,
        originY: 'center',
        originX: 'center',
        transparentCorners: false,
        padding: 0,
        cornerSize: 15,
        cornerColor: 'rgba(0,0,0,0.7)',
        borderColor: 'rgba(0,0,0,0.5)',
      });

      triangle.setControlVisible('bl', false);
      triangle.setControlVisible('br', false);
      triangle.setControlVisible('mb', false);
      triangle.setControlVisible('ml', false);
      triangle.setControlVisible('mr', false);
      triangle.setControlVisible('mt', false);
      triangle.setControlVisible('tl', false);
      triangle.setControlVisible('tr', false);
      triangle._collage_id = id;
      triangle.overlaps = overlaps;
      triangle.rotate(r);

      callback(triangle);
    });
  }

  // get intersection coordinates relative to top point in bottom triangle and angle
  triangle2triangleIntersection = (top, bottom, bottomAngle) => {
    // for each line, check the lines in the other triangle
    const intersections = [];
    for (let i = 0; i < 3; i += 1) {
      const p0 = top[i];
      const p1 = top[(i + 1) % 3];

      for (let j = 0; j < 3; j += 1) {
        const p2 = bottom[j];
        const p3 = bottom[(j + 1) % 3];
        const lineIntersection = this.line2lineIntersection(p0, p1, p2, p3);
        if (lineIntersection) {
          intersections.push(lineIntersection);
        }
      }
    }

    const pointsInside = [];
    if (intersections.length === 2) {
      // There should be 2 intersections
      // Find the 1 or 2 points inside
      top.forEach((v, i) => {
        // is it inside bottom?
        if (this.pointInTriangle(v, bottom)) {
          pointsInside.push({i, v});
        }
      });
      bottom.forEach((v, i) => {
        // is it inside bottom?
        if (this.pointInTriangle(v, top)) {
          pointsInside.push({i, v});
        }
      });

      let newShape;
      if (pointsInside.length === 1) {
        newShape = intersections.concat(pointsInside);
      } else if (pointsInside.length === 2) {
        newShape = [intersections[0], pointsInside[0], intersections[1], pointsInside[1]];
      }

      // translate shapes points into polar coordinates relative to bottom triangle
      const topTip = bottom[0];
      const scale = this.distBetweenPoints(bottom[0], bottom[1])
      const newShapePolar = [];
      newShape.forEach(v => {
        let p = v;
        if (v.v) {
          p = v.v;
        }

        // scale by triangle size
        const dist = this.distBetweenPoints(p, topTip) / scale;

        // console.log((Math.PI * (bottomAngle / 180)), this.angleBetweenPoints(p, topTip));
        //const angle = (Math.PI * (bottomAngle / 180)) + this.angleBetweenPoints(p, topTip);
        const angle = -(Math.PI * (bottomAngle / 180)) + this.angleBetweenPoints(p, topTip);
        // } else {
        //   angle = this.angleBetweenPoints(p, topTip);
        // }
        newShapePolar.push({ dist, angle });
      });
      // console.log(newShapePolar);

      return newShapePolar;
    }

    return false;
  }

  // Get interseting point of 2 line segments (if any)
  // Attribution: http://paulbourke.net/geometry/pointlineplane/
  line2lineIntersection = (p0,p1,p2,p3) => {
    var unknownA = (p3.x-p2.x) * (p0.y-p2.y) - (p3.y-p2.y) * (p0.x-p2.x);
    var unknownB = (p1.x-p0.x) * (p0.y-p2.y) - (p1.y-p0.y) * (p0.x-p2.x);
    var denominator  = (p3.y-p2.y) * (p1.x-p0.x) - (p3.x-p2.x) * (p1.y-p0.y);

    // Test if Coincident
    // If the denominator and numerator for the ua and ub are 0
    //    then the two lines are coincident.
    if(unknownA === 0 && unknownB === 0 && denominator === 0){return(null);}

    // Test if Parallel
    // If the denominator for the equations for ua and ub is 0
    //     then the two lines are parallel.
    if (denominator === 0) return null;

    // If the intersection of line segments is required
    // then it is only necessary to test if ua and ub lie between 0 and 1.
    // Whichever one lies within that range then the corresponding
    // line segment contains the intersection point.
    // If both lie within the range of 0 to 1 then
    // the intersection point is within both line segments.
    unknownA /= denominator;
    unknownB /= denominator;

    var isIntersecting=(unknownA>=0 && unknownA<=1 && unknownB>=0 && unknownB<=1)

    if(!isIntersecting){return(null);}

    return({
        x: p0.x + unknownA * (p1.x-p0.x),
        y: p0.y + unknownA * (p1.y-p0.y)
    });
  }

  // https://github.com/mattdesl/point-in-triangle
  pointInTriangle = (point, triangle) => {
    //compute vectors & dot products
    var cx = point.x, cy = point.y,
        t0 = triangle[0], t1 = triangle[1], t2 = triangle[2],
        v0x = t2.x-t0.x, v0y = t2.y-t0.y,
        v1x = t1.x-t0.x, v1y = t1.y-t0.y,
        v2x = cx-t0.x, v2y = cy-t0.y,
        dot00 = v0x*v0x + v0y*v0y,
        dot01 = v0x*v1x + v0y*v1y,
        dot02 = v0x*v2x + v0y*v2y,
        dot11 = v1x*v1x + v1y*v1y,
        dot12 = v1x*v2x + v1y*v2y

    // Compute barycentric coordinates
    var b = (dot00 * dot11 - dot01 * dot01),
        inv = b === 0 ? 0 : (1 / b),
        u = (dot11*dot02 - dot01*dot12) * inv,
        v = (dot00*dot12 - dot01*dot02) * inv
    return u>=0 && v>=0 && (u+v < 1)
  }

  distBetweenPoints = (p0, p1) => {
    return Math.sqrt(((p0.x-p1.x)**2) + ((p0.y-p1.y)**2));
  }

  angleBetweenPoints = (p0, p1) => {
    // console.log(p0.y-p1.y, p0.x-p1.x, Math.atan2(p0.y-p1.y, p0.x-p1.x));
    return Math.atan2(p0.y-p1.y, p0.x-p1.x);
  }

  render() {
    const { isRender } = this.props;
    let filter = 'grayscale(100%) brightness(1.05) contrast(150%)';
    if (isRender) {
      filter = 'none';
    }
    return (
      <canvas width="300" height="300" style={{ filter: filter }}></canvas>
    );
  }
}
