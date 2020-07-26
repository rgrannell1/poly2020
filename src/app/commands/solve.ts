
import findRoots from 'durand-kerner'

import storage from '../../app/storage/index.js'
import * as bounds from '../../app/bounds.js'
import * as configModule from '../../app/config.js'

import {
  Tile,
  Grid,
  Solution,
  RootGenerator,
  BinGenerator
} from '../../commons/types'

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
const solvePolynomials = function * (iter:any):RootGenerator {
  let count = 0
  for (let coords of iter) {
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

interface RawPolyArgs {
  "--config": string,
  "--name": string,
  show: Boolean
}

const getFilePaths = (coeff:number, order:number) => {
  const date = Date.now()
  return {
    storagePath: `data/${order}-${coeff}.bin`,
    metadataPath: `data/${order}-${coeff}.metadata.json`
  }
}

const solve = async (rawArgs:RawPolyArgs) => {
  const configPath = rawArgs['--config']
  const name = rawArgs['--name']

  const config = await configModule.load(configPath, name)
  const {
    count,
    order
  } = config.polynomial

  const targetCoeff = bounds.calculate(count, order)
  const minCoeff = await storage.read.startCoefficient(order, 'data')

  // -- write the solutions
  for (let coeff = minCoeff; coeff <= targetCoeff; ++coeff) {
    console.log(`${coeff} coeff`)

    const spaceIter = bounds.edgeSpace(coeff, order)  
    const solveIter = solvePolynomials(spaceIter)
  
    const binIter = binSolutions(solveIter, {
      resolution: config.image.resolution,
      xBounds: config.image.bounds.x,
      yBounds: config.image.bounds.y
    })

    const transcoder = new storage.BinaryTranscoder(16)
    const filterIter = storage.transform.uniqueAsBinary(binIter, transcoder)
  
    const {
      storagePath,
      metadataPath
    } = getFilePaths(coeff, order)

    await storage.write.solutions(filterIter, {
      storagePath,
      metadataPath,
      coeff,
      order
    })
  }
}

export default solve
