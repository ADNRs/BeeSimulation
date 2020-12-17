let FITNESS_INTERVAL = 1200
let KILL_SCORE = 20
let COLLECT_SCORE = 3
let CHROMOSOME_NUM = 8
let RECOMBINATION_RATE = 0.5
let MUTATION_RATE = 0.5

class GeneticAlgorithm {
  constructor(chromosomeNum) {
    this.chromosomeNum = chromosomeNum
    this.chromosomes = new Array()
    this.records = new Array()
    this.helper = new GeneticAlgorithmHelper()
    this.bestChromosome

    for (let i = 0; i < chromosomeNum; i++) {
      this.chromosomes.push(this.helper.getChromosome())
      this.records.push(new ChromosomeRecord())
    }
  }

  evaluate() {
    this.chromosomes = this.mutate(this.recombine(this.select()))
  }

  fitnessFunction(kill, collect) {
    return kill*KILL_SCORE + collect*COLLECT_SCORE
  }

  select() {
    let fitnesses = new Array()
    let newChromosomes = new Array()
    let bestFitness = -Infinity
    for (let i = 0; i < this.chromosomes.length; i++) {
      let record = this.records[i].get()
      let fitness = this.fitnessFunction(record.kill, record.collect)
      fitnesses.push(fitness)
      if (fitness > bestFitness) {
        this.bestChromosome = this.chromosomes[i]
      }
    }
    for (let i = 0; i < this.chromosomes.length; i++) {
      let opponent = i + 1 != this.chromosomes.length ? i + 1 : 0
      if (fitnesses[i] == 0 && fitnesses[opponent] == 0) {
        newChromosomes.push(this.helper.getChromosome())
      }
      else {
        newChromosomes.push(
          fitnesses[i] > fitnesses[opponent] ? this.chromosomes[i] : this.chromosomes[opponent]
        )
      }
    }
    return newChromosomes
  }

  recombine(newChromosomes) {
    for (let i = 0; i < this.chromosomeNum; i += 2) {
      if (Math.random() > RECOMBINATION_RATE) {
        continue
      }
      let start = this.helper.randInt(0, this.helper.param.length-1)
      let end   = this.helper.randInt(start, this.helper.param.length-1)
      for (let j = start; j <= end; j++) {
        let temp = newChromosomes[i][j]
        newChromosomes[i][j] = newChromosomes[i+1][j]
        newChromosomes[i+1][j] = temp
      }
    }
    return newChromosomes
  }

  mutate(newChromosomes) {
    for (let chromosome of newChromosomes) {
      for (let i = 0; i < 9; i++) {
        if (Math.random() < MUTATION_RATE) {
          chromosome[i] = this.helper.getChromosomeMutation(i)
          if (chromosome[i] < this.helper.param[i][2]) {
            chromosome[i] = this.helper.param[i][2]
          }
          else if (chromosome[i] > this.helper.param[i][3]) {
            chromosome[i] = this.helper.param[i][3]
          }
        }
      }
    }
    return newChromosomes
  }
}

class GeneticAlgorithmHelper {
  constructor() {
    this.param = [
      ['sep',   'float',  0,   1],
      ['ali',   'float',  0,   1],
      ['coh',   'float',  0,   1],
      ['sen',   'float',  0,   1],
      ['mem',   'float',  0,   1],
      ['wan',   'float',  0,   1],
      ['atk',   'float',  0,   1],
      ['dist',  'float', 50, 300],
      ['angle', 'float', 10, 180]
    ]
  }

  randFloat(min, max) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random()*(max - min) + min
  }

  randInt(min, max) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random()*(max - min) + min)
  }

  getChromosome() {
    let chromosome = new Array()
    for (let [name, type, min, max] of this.param) {
      chromosome.push(this.randFloat(min, max))
    }
    return chromosome
  }

  getChromosomeMutation(i) {
    return this.randFloat(this.param[i][2], this.param[i][3])
  }
}

class ChromosomeRecord {
  constructor() {
    this.kill = 0
    this.collect = 0
  }

  get() {
    let record = {
      kill: this.kill,
      collect: this.collect
    }
    this.reset()
    return record
  }

  reset() {
    this.kill = 0
    this.collect = 0
  }
}
