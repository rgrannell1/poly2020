
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

type Solution = number[][]

const asGrid = (solution:Solution, grid:Grid):Tile => {
  const x = 1
  const y = 1

  return {
    x,
    y
  }
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
  const iters = repeat(() => range(-2, +2), 5)

  for (let coords of itools.product(...iters)) {
    yield findRoots(coords)    
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
    console.log(err)
    throw new Error(`failed to load ${configPath} as JSON`)
  }

  const config = configs[name]

  let ith = 0
  for (const solution of solvePolynomials(config)) {
    ith++

    if (ith % 1_000_000 === 0) {
      console.log(ith)
    }
  }
}

export default poly
