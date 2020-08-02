
import findRoots from 'durand-kerner'

import storage from '../../app/storage/index.js'
import CoefficientSpace from '../coefficient-space.js'
import * as configModule from '../../app/config.js'
import SolveProgress from '../progress/solve-progress.js'

import {
  Pixel,
  Grid,
  Solution,
  RootGenerator,
  PixelGenerator,
  RawPolyArgs
} from '../../commons/types'

/**
 * Convert 
 * 
 * @param solution 
 * @param grid 
 */
const asPixel = (solution:Solution, grid:Grid):Pixel => {
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
const solvePolynomials = function * (iter:any, bar:SolveProgress):RootGenerator {
  let count = bar.count
  let buffer = []

  for (let coords of iter) {
    const data = findRoots(coords)    
    count += 4 // -- remove hardcoding!

    if (count % 100_000 === 0) {     
      bar.update(count)
    }

    buffer.push(data)

    if (buffer.length > 100_000) {
      bar.update(count)
      yield buffer
      buffer = []
    }
  }
  bar.update(count)

  yield buffer
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
function * binSolutions (iter:RootGenerator, opts:BinSolutionOpts):PixelGenerator {  
  const grid:Grid = {
    xBins: opts.resolution,
    yBins: opts.resolution,
    xBounds: opts.xBounds,
    yBounds: opts.yBounds
  }

  for (const coord of iter) {
    const buffer = []

    // -- zip the real and imag parts
    for (const [real, imag] of coord) {
      for (let ith = 0; ith < real.length; ++ith) {
        const x = real[ith]
        const y = imag[ith]

        // -- discard missing solutions
        if (Number.isNaN(x) || Number.isNaN(y)) {
          // -- yield empty rather than continue to make the progress-bar accurate.
           
        } else {
          // -- convert the coordinates into 0...resolution pixel-space
          const coord = asPixel([x, y], grid)

          // -- discard solutions out of bounds.
          if (coord.x < 0 || coord.x > grid.xBins || coord.y < 0 || coord.y > grid.yBins) {

          } else {
            buffer.push(coord)
          }
        }
      }
    }

    yield buffer
  }
}

const getFilePaths = (coeff:number, order:number) => {
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

  const targetCoeff = CoefficientSpace.requiredSize(count, order)
  const minCoeff = await storage.read.startCoefficient(order, 'data')

  const bar = new SolveProgress()  
  const solutions = CoefficientSpace.solutions(targetCoeff, order)

  await bar.start(order, solutions, 'data')

  // -- write the solutions
  for (let coeff = minCoeff; coeff <= targetCoeff; ++coeff) {
    const space = CoefficientSpace.enumerateEdges(coeff, order)  
    const solveIter = solvePolynomials(space, bar)
  
    const binIter = binSolutions(solveIter, {
      resolution: config.image.resolution,
      xBounds: config.image.bounds.x,
      yBounds: config.image.bounds.y
    })

    const binarySolutions = storage.transform.encodePixelsAsBinary(binIter)
  
    const {
      storagePath,
      metadataPath
    } = getFilePaths(coeff, order)

    await storage.write.solutions(binarySolutions, {
      bar,
      storagePath,
      metadataPath,
      coeff,
      order
    })
  }
}

export default solve
