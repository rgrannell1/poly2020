

import * as storage from '../../app/storage/index.js'
import * as fs from 'fs'
import * as pixels from 'save-pixels'
import * as zeros from 'zeros'
import * as cliProgress from 'cli-progress'
import  signale from 'signale'

import * as colours from '../../commons/colours.js'
import * as bounds from '../../app/bounds.js'
import * as configModule from '../../app/config.js'

const progress = cliProgress.default


import {
  BinGenerator,
  RawPolyArgs  
} from '../../commons/types'

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
    format: '[{bar}] | remaining: {eta_formatted} | ran for: {duration_formatted} | {value} / {total}'
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

    writeStream.on('finish', async () => {
      const stat = await fs.promises.stat(opts.fpath)
      const size = (stat.size / 1e6).toFixed(1)

      const secondsElapsed = Math.floor((Date.now() - writeStart) / 1000)
      signale.success(`ran for: ${secondsElapsed}s (${opts.resolution} x ${opts.resolution}, ${size}MB)`)

      resolve()
    })
    writeStream.on('error', reject)
  })
}

const draw = async (rawArgs:RawPolyArgs) => {
  const configPath = rawArgs['--config']
  const name = rawArgs['--name']

  const config = await configModule.load(configPath, name)

  const solutions = await storage.readSolutions(config.polynomial.order, 'data')

  for await (const solution of solutions) {

  }

  return

  /*

    await saveArgandGraph(binIter, {
    resolution: config.image.resolution,
    fpath: config.image.outputPath,
    count: config.polynomial.count,
    order: config.polynomial.order
  })
  */
}

export default draw
