class GeneticAlgorithm {
  constructor(chromosomeNum) {
    this.chromosomes = new Array()
    this.helper = new GeneticAlgorithmHelper()

    for (let i = 0; i < chromosomeNum; i++) {
      this.chromosomes.push(this.helper.getChromosome())
    }
  }

  evaluate() {

  }

  fitnessFunction() {

  }

  select() {

  }

  recombine() {

  }

  mutate() {

  }

  inverse() {

  }
}

class GeneticAlgorithmHelper {
  constructor() {
    this.param = [
      ['sep',   'float', -50,   50 }],
      ['ali',   'float', -50,   50 }],
      ['coh',   'float', -50,   50 }],
      ['sen',   'float', -50,   50 }],
      ['mem',   'float', -50,   50 }],
      ['wan',   'float', -50,   50 }],
      ['atk',   'float', -50,   50 }],
      ['dist',  'float',   0, 1000 }],
      ['angle', 'float',   0,  180 }]
    ]
  }

  randFloat(min, max) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random()*(max - min) + min
  }

  getChromosome() {
    let chromosome = new Array()
    for (let [name, type, min, max] of this.param) {
      chromosome.push(randFloat(min, max))
    }
    return chromosome
  }
}
