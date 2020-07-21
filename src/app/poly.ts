
import * as path from 'path'
import * as fs from 'fs'

import itools, { iter } from 'iter-tools'
import { count } from 'console'

import findRoots from 'durand-kerner'

interface RawPolyArgs {
  "<fpath>": string,
  "<name>": string
}

interface SolvePolynomialArgs {

}

// -- project onto grid
interface Grid {
  xBins: number
  yBins: number
  xBounds: [number, number],
  yBounds: [number, number]
}

interface Tile {
  x: number,
  y: number
}

type Solution = number[]

const asTile = (solution:Solution, grid:Grid):Tile => {
  const xDiff = (grid.xBounds[1] -grid.xBounds[0]) / grid.xBins
  const x = Math.floor((Math.abs(grid.xBounds[0]) + solution[0]) / xDiff)
  
  const yDiff = (grid.yBounds[1] -grid.yBounds[0]) / grid.yBins
  const y = Math.floor((Math.abs(grid.yBounds[0]) + solution[1]) / yDiff)

  return { x, y }
}

const repeat = (fn:any, count:number) => {
  const output = []

  for (let ith = 0; ith < count; ++ith) {
    output[ith] = fn()
  }

  return output
}

const range = function * (lower:number, upper:number) {
  for (let ith = lower; ith <= upper; ++ith) {
    yield ith
  }
}

const solvePolynomials = function * (config:SolvePolynomialArgs) {
  const iters = repeat(() => range(-20, +20), 5)

  for (let coords of itools.product(...iters)) {
    yield findRoots(coords)    
  }
}

function * binSolutions (iter:any) {
  const grid:Grid = {
    xBins: 1000,
    yBins: 1000,
    xBounds: [-10, +10],
    yBounds: [-10, +10]   
  }

  for (const [real, imag] of iter) {
    for (let ith = 0; ith < real.length; ++ith) {
      const x = real[ith]
      const y = imag[ith]

      if (Number.isNaN(x) || Number.isNaN(y)) {
        continue
      }

      const coord = asTile([x, y], grid)

      if (coord.x < 0 || coord.x > grid.xBins) {
        continue
      }
      if (coord.y < 0 || coord.y > grid.yBins) {
        continue
      }

      yield coord
    }
  }

}

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

  const iter = solvePolynomials(config)

  for (const coord of binSolutions(iter)) {
    console.log(coord)
  }
}

export default poly
