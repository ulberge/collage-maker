import { Individual } from './Population.js';

export class CollagePiece {
  constructor(image, position, rotation = 0, scale = 1, transparency = 1) {
    this.image = image; // rgba[][]
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.transparency = transparency;
  }
}

export class Collage extends Individual {
  constructor(genotype = [], config) {
    super(genotype);
    this.config = config;
  }

  getImage() {
    // layer the pieces into a canvas and return the image created
  }

  mutate() {
    // select a random point, check how good the fitness moment is for that location
    // based on the quality of fitness moment, scale the level of mutation
    // if low quality, higher probability of adding or removing collage pieces that overlap
    // if higher quality, higher probability of small changes to scale, rotation, position, or
    // transparency of nearby collage pieces
    const child = new Collage(this.genotype.slice(), this.config);

    // when you change CollagePieces, make sure to create new CollagePiece
    return child;
  }

  crossover(mate) {
    const p0Genotype = this.genotype.slice(0, Math.floor(this.genotype.length / 2));
    const p1Genotype = mate.genotype.slice(Math.floor(mate.genotype.length / 2));

    const childGenotype = p0Genotype.concat(p1Genotype);

    const child = new Collage(childGenotype, this.config);
    return child;
  }

  fillRandom() {
    // create an array of CollagePieces of size range.num
    // select a random image, position, rotation, scale, transparency using ranges from config
  }
}
