import ProcessNode from './ProcessNode';

export default class CropPieceNode extends ProcessNode {
  draw = p => {
    const { inputs, onFinished } = this.props;
    const { piece, coords } = inputs;

    if (!piece || !coords) {
      return;
    }

    if (this.prevCoords && this.isEqual(coords, this.prevCoords)) {
      return;
    }
    this.prevCoords = coords;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = 0;
    let maxY = 0;
    coords.forEach(v => {
      const x = v[0];
      const y = v[1];
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
    let w = Math.abs(maxX - minX);
    let h = Math.abs(maxY - minY);

    this.updateSize(p, w, h);
    if (!p.width || !p.height) {
      return;
    }

    p.background(255);
    const pieceCropped = piece.get(minX, minY, w, h);
    p.image(pieceCropped, 0, 0, p.width, p.height);

    onFinished({
      id: this.nextID(),
      img: pieceCropped,
      coords
    });
  }

  isEqual = (a1, a2) => {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  nextID = () => {
    if (this.ID === undefined) {
      this.ID = -1;
    }
    this.ID += 1;
    return this.ID;
  }
}
