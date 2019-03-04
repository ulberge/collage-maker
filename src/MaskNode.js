import ProcessNode from './ProcessNode';

export default class MaskNode extends ProcessNode {
  draw = p => {
    const { inputs, onFinished } = this.props;
    const { w, h, palette, srcImg } = inputs;

    this.updateSize(p, w, h);

    if (!p.width || !p.height) {
      return;
    }

    const coords = this.getNonIntersectingRandomTriangle(p);

    if (coords) {
      const mask = p.createGraphics(w, h);
      mask.background(255, 255, 255, 0);
      mask.fill(255, 255, 255, 255);
      mask.noStroke();

      this.drawPiece(mask, coords);

      //p.background(0);
      p.image(srcImg, 0, 0, p.width, p.height);

      p.push();
      p.scale(this.getScale());
      p.push();
      p.tint(255, 220);
      p.image(mask, 0, 0);
      p.pop();

      if (palette) {
        p.fill(255, 255, 255, 140);
        p.noStroke();
        palette.forEach(item => this.drawPiece(p, item.coords));
      }

      p.pop();

      onFinished(mask, coords);

      mask.remove();
    }
  }

  drawPiece = (p, coords) => {
    p.beginShape();
    coords.forEach(v => {
      p.vertex(v[0], v[1]);
    });
    p.endShape(p.CLOSE);
  }

  getNonIntersectingRandomTriangle = p => {
    const { inputs } = this.props;
    let { palette } = inputs;

    if (!palette) {
      palette = [];
    }

    let newCoords;
    const limit = 10000;

    for (let i = 0; i < limit; i += 1) {
      newCoords = this.getRandomTriangle();

      let isOverlap = false;
      palette.forEach(item => {
        const { coords } = item;
        if (this.hasOverlap(coords, newCoords)) {
          isOverlap = true;
        }
      });

      if (!isOverlap) {
        return newCoords;
      }
    }

    console.log('cannot find openings for new piece');

    return null;
  }

  hasOverlap = (t0, t1) => {
    return this.triangle2triangleHasOverlap(t0, t1);
  }

  getRandomTriangle = () => {
    const { inputs } = this.props;
    const { size, w, h } = inputs;

    const s_th = Math.random() * Math.PI * 2;
    const c_x = (Math.random() * (w - (2 * size))) + size;
    const c_y = (Math.random() * (h - (2 * size))) + size;

    let minX = Infinity;
    let minY = Infinity;

    const coords = [];
    for (let i = 0; i < 3; i += 1) {
      const th = s_th + (i * (Math.PI * 2 / 3));
      const x = c_x + (size * Math.cos(th));
      const y = c_y + (size * Math.sin(th));

      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      coords.push([x, y]);
    }

    return coords;
  }

  triangle2triangleHasOverlap = (t0, t1) => {
    // for each line, check the lines in the other triangle
    for (let i = 0; i < 3; i += 1) {
      const p0 = t0[i];
      const p1 = t0[(i + 1) % 3];

      for (let j = 0; j < 3; j += 1) {
        const p2 = t1[j];
        const p3 = t1[(j + 1) % 3];
        const hasIntersection = this.line2lineIntersection(p0, p1, p2, p3)

        if (hasIntersection) {
          return true;
        }
      }
    }

    return false;
  }

  // Get interseting point of 2 line segments (if any)
  // Attribution: http://paulbourke.net/geometry/pointlineplane/
  line2lineIntersection = (p0,p1,p2,p3) => {
    var unknownA = (p3[0]-p2[0]) * (p0[1]-p2[1]) - (p3[1]-p2[1]) * (p0[0]-p2[0]);
    var unknownB = (p1[0]-p0[0]) * (p0[1]-p2[1]) - (p1[1]-p0[1]) * (p0[0]-p2[0]);
    var denominator  = (p3[1]-p2[1]) * (p1[0]-p0[0]) - (p3[0]-p2[0]) * (p1[1]-p0[1]);

    // Test if Coincident
    // If the denominator and numerator for the ua and ub are 0
    //    then the two lines are coincident.
    if(unknownA==0 && unknownB==0 && denominator==0){return(null);}

    // Test if Parallel
    // If the denominator for the equations for ua and ub is 0
    //     then the two lines are parallel.
    if (denominator == 0) return null;

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
        x: p0[0] + unknownA * (p1[0]-p0[0]),
        y: p0[1] + unknownA * (p1[1]-p0[1])
    });
  }
}
