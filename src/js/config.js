let config = {
  target: null, // rgba[][]
  palette: [], // array of image data in rgba[][]
  population: {
    num: 9,
    numBreedingParents: 4,
    numElite: 3,
    numCrossover: 3,
    numMutate: 3,
    mutationRate: 0.1
  },
  range: {
    num: {
      min: 3,
      max: 20
    },
    scale: {
      min: 1,
      max: 1
    },
    transparency: {
      min: 1,
      max: 1
    },
    rotation: {
      min: 0,
      max: Math.PI * 2
    },
    position: {
      min: {
        x: 0,
        y: 0
      },
      max: {
        x: 0,
        y: 0
      }
    }
  }
};

export default config;
