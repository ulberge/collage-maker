import { Population } from './Population.js';
import { Collage } from './Collage.js';

export default class CollageMaker {
  constructor(config, target) {
    this.config = config;
    this.target = target;
  }

  next(palette) {
    if (!palette || !this.target || palette.length === 0) {
      return [];
    }

    const randomOrder = this.shuffle(palette.slice());
    const pieces = this.getPieces(randomOrder);

    return pieces;
  }

  getPieces(gridImages) {
    const pieces = [];
    let y = 0;
    let x = 0;
    const w = this.target.width;

    gridImages.forEach(image => {
      if (x >= w) {
        y += image.height;
        x = 0;
      }

      const startX = x;
      const startY = y;
      const r = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5][Math.floor(Math.random() * 4)];
      const piece = { startX, startY, image, r };
      pieces.push(piece);

      x += image.width;
    });

    return pieces;
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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

  run() {
    // clear data

    // check that we have a palette and target
    if (!this.palette || !this.target) {
      return;
    }

    // create paletteMin
    // addMinifiedVersion(config.palette);

    // perform initial calculations on target image
    const targetData = {
      moments: this.getImageMoments(this.target)
    };
    this.config.targetData = targetData;
    console.log(targetData);

    // run search
    this.search();
  }

  // search for closest match to target from palette
  search() {
    // use evolutionary search algorithm

    // create an initial population
    const collages = this.getInitialIndividuals();
    const population = new Population(collages, this.config.population);

    // calculate its fitness data
    population.individuals.forEach(c => this.calculateFitness(c, this.config.targetData.moments));

    // render population and fitness data
    // ?

    // generate the next generation based on fitness data
    population.next();

    // repeat
  }

  getImageMoments(resolutions, image) {
    // create reduced size version at scales of 4^x for each resolution

    let moments;
    // temp, hsv, value: https://gka.github.io/chroma.js/
    // image moments: https://github.com/mgcrea/image-moments
    // for each size
    //  create greyscale based on value
    //  create temperature (rgb -> kelvin)
    //  create hue (rgb -> hsv)
    // moments = {
    //   value: {
    //     0: scores,
    //     2: scores,
    //     5: scores
    //   },
    //   temp: {},
    //   hue: {}
    // };

    return moments;
  }

  // return an array of Collages
  getInitialIndividuals() {
    const initialPopulation = [];
    for (let i = 0; i < this.config.population.num; i += 1) {
      const c = new Collage([], this.config);
      c.fillRandom();
      initialPopulation.push(c);
    }

    return initialPopulation;
  }

  calculateFitness(collage, targetMoments) {
    // get the composite images
    const collageMoments = this.getImageMoments([0, 2, 5], collage.getImage());

    // compare different scale image moments with respective moments from target
    // compare collageMoments to targetMoments
    // store calculations of mid level grids for use in collage mutations
    // for each grid of moments, calculate distance grid and total up the grid

    // add together weighted difference totals for each grid
    // also include the grid data on the return
  }
}
