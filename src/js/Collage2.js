export default class Collage2 {
  constructor(rowSize, colSize, test) {
    this.rowSize = rowSize;
    this.colSize = colSize;
    this.test = test;
  }

  start = (palette) => {
    const randomOrder = this.shuffle(palette.slice());

    const numPieces = this.rowSize * this.colSize;

    if (numPieces > randomOrder.length) {
      console.log('not enough pieces');
      return;
    }

    const images = randomOrder.slice(0, numPieces).map(image => {
      const r = this.getR();
      return { image, r };
    });
    const remaining = randomOrder.slice(numPieces);

    this.state = { images, remaining };
    this.score = Infinity;
  }

  // next() {
  //   // remove one image at random and replace with an image from the remaining palette
  //   const indexToRemove = Math.floor(Math.random() * this.images.length);
  //   const oldImageItem = this.images[indexToRemove];

  //   const indexToAdd = Math.floor(Math.random() * this.remainingPalette.length);
  //   const image = this.remainingPalette[indexToAdd];

  //   this.remainingPalette.push(oldImageItem.image);

  //   const r = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5][Math.floor(Math.random() * 4)];
  //   this.images[indexToRemove] = { image, r };

  //   return this.images;
  // }

  // hill climb
  next = () => {
    const neighbor = this.getRandomNeighbor();
    const score = this.test(neighbor.images);

    console.log(score, this.score);
    if (score < this.score) {
      // replace
      this.score = score;
      this.state = neighbor;
    }

    return this.state.images;
  }

  getRandomNeighbor = () => {
    const { images, remaining } = this.state;

    // remove one image at random and replace with an image from the remaining palette
    const indexToRemove = Math.floor(Math.random() * images.length);
    const oldImageItem = images[indexToRemove];

    const indexToAdd = Math.floor(Math.random() * remaining.length);
    const image = remaining[indexToAdd];

    const newRemaining = remaining.slice();
    newRemaining.push(oldImageItem.image);

    const newImages = images.slice();

    const r = this.getR();
    newImages[indexToRemove] = { image, r };

    return {
      images: newImages,
      remaining: newRemaining
    };
  }

  getR() {
    //return [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5][Math.floor(Math.random() * 4)];
    return Math.random() * Math.PI;
  }

  shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
