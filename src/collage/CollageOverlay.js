import React from 'react';
import ReactDOM from 'react-dom';

import { fabric } from 'fabric';

export default class CollageOverlay extends React.Component {

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
      'mouse:up': this.doQueue
    });
    this.canvas.selection = false;

    window.addEventListener('resize', this.onWindowResize, false);

    this.renderPieces();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { pieces, placedPieces, processedPieces, scale } = this.props;

    if (!nextProps || !nextState) {
      return true;
    }

    // if the placedPieces are not the same
    if (placedPieces.length !== nextProps.placedPieces.length) {
      return true;
    }

    pieces.forEach((piece, i) => {
      const { id, selected } = piece;

      const { dataURL } = processedPieces[id];
      // if the dataURLS are not the same
      if (dataURL !== nextProps.processedPieces[id].dataURL) {
        return true;
      }

      // if selection is not not the same
      if (selected !== nextProps.pieces[i].selected) {
        return true;
      }
    });

    // if the scale is not the same
    if (scale !== nextProps.scale) {
      return true;
    }

    return true;
  }


  componentDidUpdate() {
    this.canvas.clear();
    // Keep track of renders to prevent old async renders from still happening (image load is async)
    if (this.currentRenderIndex === undefined) {
      this.currentRenderIndex = -1;
    }
    this.currentRenderIndex += 1;
    this.renderPieces(this.currentRenderIndex);
  }

  checkOverlap = options => {
    options.target.setCoords();

    // Remove all the overlaps on this piece, because it is now brought to the front
    options.target.overlaps = {};

    // Find all the overlaps between the object last moved and any other triangle
    // The last moved piece is brought to the front, so add overlaps to those underneath
    const targetCoords = this.getCoords(options.target);
    this.canvas.forEachObject((obj) => {
      if (obj === options.target) return; // Do not check overlaps with itself

      const otherCoords = this.getCoords(obj);
      const overlap = this.triangle2triangleIntersection(targetCoords, otherCoords, obj.angle);
      console.log(overlap);
      if (overlap) {
        obj.overlaps[options.target._collage_id] = overlap; // Add an overlap between these pieces to bottom
      } else if (obj.overlaps[options.target._collage_id] !== undefined) {
        delete obj.overlaps[options.target._collage_id]; // If no overlap, remove any that is recorded
      }
    });
  }

  // Get the coords of the triangle from the bounding coords
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
    const { pieces, processedPieces, placedPieces, scale } = this.props;

    this.triangles = [];
    let newPieceCount = 0;
    pieces.forEach((piece, i) => {
      const { id } = piece;
      // Not processed or placed
      if (!processedPieces[id] || !placedPieces.includes(id)) {
        return
      }

      const { dataURL } = processedPieces[id];
      // Set to defaults unless we have created data for it
      let data;
      if (this.placedPiecesData[id]) {
        data = this.placedPiecesData[id]
      } else {
        // new piece
        data = { x: 5 * scale + (0.01 * newPieceCount), y: 4 * scale + (0.002 * newPieceCount), r: 0, overlaps: {} };
        newPieceCount++;
      }

      const { x, y, r, overlaps } = data;
      this.createTriangle(id, x, y, r, overlaps, dataURL, triangle => {
        if (this.currentRenderIndex !== renderIndex) {
          // stale async call, dont do
          return;
        }
        this.canvas.add(triangle);
        this.triangles.push(triangle);

        // Set selected piece
        if (piece.selected) {
          this.canvas.setActiveObject(triangle);
        }
      });
    });
  }

  queueUpdate = options => {
    this.updateDelayed = () => this.updatePieces(options);
  }

  doQueue = () => {
    if (this.updateDelayed) {
      this.updateDelayed();
    }
  }

  cancelUpdate = () => {
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
      triangle.scale(this.scale * scale / 20).set({
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

      // var filter = new fabric.Image.filters.Grayscale();
      // triangle.filters.push(filter);
      // triangle.applyFilters();

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
    // For each line in the top
    for (let i = 0; i < 3; i += 1) {
      const p0 = top[i];
      const p1 = top[(i + 1) % 3];

      // For each line in the bottom
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

    // There should be 0, 2, 4, or 6 intersections
    if (intersections.length === 0) {
      return false;
    }

    // figure out shapes of intersection
    let newShape;
    if (intersections.length === 6) {
      newShape = [intersections[0], intersections[1], intersections[2], intersections[3], intersections[4], intersections[5]];
    } else if (intersections.length === 4) {
      newShape = [intersections[0], intersections[1], intersections[2], intersections[3]];
    } else if (intersections.length === 2) {
      // There should be 2 intersections
      // Find the 1 or 2 points inside
      top.forEach(v => {
        // is it inside bottom?
        if (this.pointInTriangle(v, bottom)) {
          pointsInside.push(v);
        }
      });
      bottom.forEach(v => {
        // is it inside bottom?
        if (this.pointInTriangle(v, top)) {
          pointsInside.push(v);
        }
      });

      if (pointsInside.length === 1) {
        newShape = intersections.concat(pointsInside);
      } else if (pointsInside.length === 2) {
        newShape = [intersections[0], pointsInside[0], intersections[1], pointsInside[1]];
      }
    }

    // translate shapes points into polar coordinates relative to bottom triangle
    const topTip = bottom[0];
    const scale = this.distBetweenPoints(bottom[0], bottom[1])
    const newShapePolar = [];
    newShape.forEach(v => {
      newShapePolar.push(this.getPolar(v, topTip, bottomAngle, scale));
    });

    // Order by angle, break ties by distance to have a convex polygon
    console.log('newShapePolar', newShapePolar);
    newShapePolar.sort((v0, v1) => {
      // We have to round or else the angles are slightly off
      const a0 = this.round(v0.angle, 9);
      const a1 = this.round(v1.angle, 9);

      if (a0 === a1) { // if they are the same-ish, they are aligned
        if (this.round(v0.angle, 0) === 1) { // if on right side of triangle, moving away
          return v0.dist - v1.dist;
        } else { // if on left side of triangle, moving towards
          return v1.dist - v0.dist;
        }
      }
      return v0.angle - v1.angle;
    });
    console.log('newShapePolar', newShapePolar);

    return newShapePolar;
  }

  getPolar = (v, origin, originAngle, scale) => {
    const dist = this.distBetweenPoints(v, origin) / scale;
    const angle = -(Math.PI * (originAngle / 180)) + this.angleBetweenPoints(v, origin);
    const polar = { dist, angle };
    return polar;
  }

  // http://www.jacklmoore.com/notes/rounding-in-javascript/
  round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
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
    return Math.atan2(p0.y-p1.y, p0.x-p1.x);
  }

  onWindowResize = () => {
    const node = ReactDOM.findDOMNode(this);
    const container = node.parentNode.parentElement;
    this.w = container.clientWidth;
    this.scale = this.w;
    this.canvas.clear();
    this.canvas.setWidth(this.w);
    this.canvas.setHeight(this.w * this.ratio);

    // Keep track of renders to prevent old async renders from still happening (image load is async)
    if (this.currentRenderIndex === undefined) {
      this.currentRenderIndex = -1;
    }
    this.currentRenderIndex += 1;
    this.renderPieces(this.currentRenderIndex);
  }

  render() {
    const { isRender } = this.props;
    let filter = 'grayscale(100%) brightness(1.05) contrast(125%)';
    if (isRender) {
      filter = 'none';
    }
    return (
      <canvas width="300" height="300" style={{ filter: filter }}></canvas>
    );
  }
}
