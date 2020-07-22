
import * as path from 'path'
import * as fs from 'fs'
import * as pixels from 'save-pixels'
import * as zeros from 'zeros'
import * as cliProgress from 'cli-progress'
import  signale from 'signale'

import itools from 'iter-tools'
import findRoots from 'durand-kerner'

import * as utils from '../commons/utils.js'
import * as colours from '../app/colours.js'
import * as bounds from '../app/bounds.js'

const progress = cliProgress.default

import {
  Tile,
  Grid,
  Solution,
  ConfigSection,
  RootGenerator,
  BinGenerator
} from '../commons/types'
import { kStringMaxLength } from 'buffer'

/**
 * Convert 
 * 
 * @param solution 
 * @param grid 
 */
const asTile = (solution:Solution, grid:Grid):Tile => {
  // -- calculate the size of a bin.
  const xDiff = (grid.xBounds[1] -grid.xBounds[0]) / grid.xBins
  
  // -- calculate how many bins along this axis is.
  const x = Math.floor((Math.abs(grid.xBounds[0]) + solution[0]) / xDiff)
  
  // -- same for y component.
  const yDiff = (grid.yBounds[1] -grid.yBounds[0]) / grid.yBins
  const y = Math.floor((Math.abs(grid.yBounds[0]) + solution[1]) / yDiff)

  return { x, y }
}


/**
 * Solve each polynomial in a set space and yield results
 * 
 * @param config 
 */
const solvePolynomials = function * (config:ConfigSection):RootGenerator {
  const coeff = bounds.calculate(config.count, config.order)
  const coeffRanges = utils.repeat(() => {
    return utils.range(-coeff, +coeff)
  }, config.order)

  // -- todo use .count
  for (let coords of itools.product(...coeffRanges)) {
    yield findRoots(coords)    
  }
}

interface BinSolutionOpts {
  resolution: number
  xBounds: [number, number],
  yBounds: [number, number],
}

/**
 * Bin solutions into pixel coordinates
 * 
 * @param iter 
 * @param resolution 
 */
function * binSolutions (iter:RootGenerator, opts:BinSolutionOpts):BinGenerator {
  const grid:Grid = {
    xBins: opts.resolution,
    yBins: opts.resolution,
    xBounds: opts.xBounds,
    yBounds: opts.yBounds
  }

  // -- zip the real and imag parts
  for (const [real, imag] of iter) {
    for (let ith = 0; ith < real.length; ++ith) {
      const x = real[ith]
      const y = imag[ith]

      // -- discard missing solutions
      if (Number.isNaN(x) || Number.isNaN(y)) {
        // -- yield empty rather than continue to make the progress-bar accurate.
        yield
      } else {
        // -- convert the coordinates into 0...resolution pixel-space
        const coord = asTile([x, y], grid)

        // -- discard solutions out of bounds.
        if (coord.x < 0 || coord.x > grid.xBins || coord.y < 0 || coord.y > grid.yBins) {
          yield
        } else {
          yield coord
        }
      }
    }
  }
}

interface SaveArgandGraphOpts {
  resolution: number,
  fpath: string,
  count: number,
  order: number
}

/**
 * Plot and save argand diagram
 * 
 * @param coords a generator of pixel coordinates to set 
 * @param resolution the resolution of the output image
 * 
 * @returns {Promise<any>} a result promise
 */
const saveArgandGraph = (coords:BinGenerator, opts:SaveArgandGraphOpts):Promise<undefined> => {
  const start = Date.now()
  const image = zeros.default([opts.resolution, opts.resolution, 4])

  for (let ith = 0; ith < opts.resolution; ++ith) {
    for (let jth = 0; jth < opts.resolution; ++jth) {
      image.set(ith, jth, 0, 0)
      image.set(ith, jth, 1, 0)
      image.set(ith, jth, 2, 0)
      image.set(ith, jth, 3, 255)
    }  
  }

  const bar = new progress.SingleBar({
    format: '[{bar}] | remaining: {eta}s | ran for: {duration_formatted} | {value} / {total}'
  }, progress.Presets.shades_classic)

  console.log([
    '🌴 🌴 🌴 🦜 Poly2020 🦜 🌴 🌴 🌴',
    '',
    ''
  ].join('\n'))
  signale.pending('solving equations...')

  const totalSolutions = bounds.totalSolutions(opts.count, opts.order)
  bar.start(totalSolutions)

  let count = 0
  for (const coord of coords) {
    if (count % 10_000 === 0) {
      bar.update(count)
    }

    count++

    if (!coord) {
      continue
    }

    const [
      red, 
      green,
      blue,
      alpha
    ] = colours.hue(count, totalSolutions)

    image.set(coord.x, coord.y, 0, red)
    image.set(coord.x, coord.y, 1, green)
    image.set(coord.x, coord.y, 2, blue)
    image.set(coord.x, coord.y, 3, alpha) 
  }

  bar.update(count)
  bar.stop()

  const secondsElapsed = (Date.now() - start) / 1000
  const perSecond = Math.round(count / secondsElapsed).toLocaleString()

  signale.success(`${perSecond} / s`)
  signale.pending(`writing to "${opts.fpath}"...`)

  // -- note: this takes 50% of the total runtime at the moment.
  return new Promise((resolve, reject) => {
    const writeStart = Date.now()
    const writeStream = fs.createWriteStream(opts.fpath)
    pixels.default(image, 'png')
      .pipe(writeStream)

    writeStream.on('finish', () => {
      const secondsElapsed = Math.floor((Date.now() - writeStart) / 1000)
      signale.success(`ran for: ${secondsElapsed}s`)

      resolve()
    })
    writeStream.on('error', reject)
  })
}

interface RawPolyArgs {
  "<fpath>": string,
  "<name>": string
}

/**
 * The core application
 * 
 * @param rawArgs arguments provided by the CLI interface 
 */
const poly = async (rawArgs:RawPolyArgs) => {
  const configPath = rawArgs['<fpath>']
  const name = rawArgs['<name>']

  let configs
  
  try {
    const fpath = path.join(process.cwd(), 'config.json')
    const fcontent = await fs.promises.readFile(fpath)
    configs = JSON.parse(fcontent.toString())
  } catch (err) {
    throw new Error(`failed to load ${configPath} as JSON`)
  }

  const config = configs[name]

  const binIter = binSolutions(solvePolynomials(config), {
    resolution: config.resolution,
    xBounds: config.xBounds,
    yBounds: config.yBounds
  })

  await saveArgandGraph(binIter, {
    resolution: config.resolution,
    fpath: config.outputPath,
    count: config.count,
    order: config.order
  })
}

export default poly
