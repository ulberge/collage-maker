/************************************************************
*
* Population.js
* By: Erik Ulberg
*
* Defines a class that represents a population for a genetic algorithm
*
*************************************************************/
export class Individual {
  constructor(genotype = []) {
    this.genotype = genotype;
    this.fitness = null;
    this.fitnessData = null;
  }

  mutate() {
    // mutates this individual
    return new Individual(this.genotype.slice());
  }

  crossover(mate) {
    const p0Genotype = this.genotype.slice(0, Math.floor(this.genotype.length / 2));
    const p1Genotype = mate.genotype.slice(Math.floor(mate.genotype.length / 2));

    const childGenotype = p0Genotype.concat(p1Genotype);

    const child = new Individual(childGenotype);
    return child;
  }
}

export class Population {
  constructor(initialPopulation, options = {}) {
    this.individuals = initialPopulation;
    this.options = {
      numBreedingParents: options.numBreedingParents || 2,
      numElite: options.numElite || 2,
      numCrossover: options.numCrossover || 3,
      numMutate: options.numMutate || 3,
      mutationRate: options.mutationRate || 0.01
    };
  }

  // Create the next generation
  next() {
    this.sortByFitness();
    this.individuals = this.breed(this.individuals);
  }

  // Return the list of individuals in order of most fit
  sortByFitness() {
    this.individuals.sort((i0, i1) => {
      if (i0.fitness < i1.fitness) {
        return 1;
      } else if (i0.fitness === i1.fitness) {
        return 0;
      }

      return -1;
    });
  }

  /**
  * Select the best children from the previous population as parents. Use these parents for crossover breeding
  * and mutation. Make a new generation that combines the best parents, with children of crossover and mutation.
  * Implementing the algorithm described here:
  * https://www.mathworks.com/help/gads/how-the-genetic-algorithm-works.html
  */
  breed(individuals) {
    const breedingParents = individuals.slice(0, this.options.numBreedingParents);

    // Take the top parents as the 'elite'
    const elitePop = individuals.slice(0, this.options.numElite);

    // Create children using crossover breeding of best parents
    const crossoverPop = [];
    for (let i = 0; i < this.options.numCrossover; i += 1) {
      const p0 = breedingParents[Math.floor(Math.random() * breedingParents.length)];
      const p1 = breedingParents[Math.floor(Math.random() * breedingParents.length)];
      const child = p0.crossover(p1);
      crossoverPop.push(child);
    }

    // Create children by mutating the best parents
    const mutatePop = [];
    for (let i = 0; i < this.options.numMutate; i += 1) {
      const p = breedingParents[Math.floor(Math.random() * breedingParents.length)];
      const child = p.mutate();
      mutatePop.push(child);
    }

    const newIndividuals = elitePop.concat(crossoverPop, mutatePop);
    return newIndividuals;
  }
}
