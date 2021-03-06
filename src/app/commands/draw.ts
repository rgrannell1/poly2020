
import * as fs from 'fs'
import * as zeros from 'zeros'
import * as pixels from 'save-pixels'

import * as colours from '../../commons/colours.js'
import storage from '../../app/storage/index.js'
import * as configModule from '../../app/config.js'
import { log } from 'console'

const logDrawingStart = (totalSolutions:number) => {
  console.log(`🦜 drawing ${totalSolutions.toLocaleString()} solutions...`)
}

const logFinish = (fpath:string) => {
  console.log(`🦜 image saved to ${fpath}`)
}

const draw = async (rawArgs:any) => {
  const configPath = rawArgs['--config']
  const name = rawArgs['--name']

  const config = await configModule.load(configPath, name)
  const solutions = await storage.read.solutions(config.polynomial.order, 'data')

  const image = zeros.default([config.image.resolution, config.image.resolution, 4])
  const totalSolutions = await storage.read.solvedCount(config.polynomial.order, 'data')

  logDrawingStart(totalSolutions)

  for (let ith = 0; ith < config.image.resolution; ++ith) {
    for (let jth = 0; jth < config.image.resolution; ++jth) {
      image.set(ith, jth, 0, 0)
      image.set(ith, jth, 1, 0)
      image.set(ith, jth, 2, 0)
      image.set(ith, jth, 3, 255)
    }  
  }

  let ith = 0
  for await (const {x, y} of solutions) {
    ith++

    const [r, g, b, a] = colours.hue(ith, totalSolutions)

    image.set(x, y, 0, r)
    image.set(x, y, 1, g)
    image.set(x, y, 2, b)
    image.set(x, y, 3, a)
  }
  
  try {
    await fs.promises.unlink(config.image.outputPath)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(config.image.outputPath)
    pixels.default(image, 'png')
      .pipe(writeStream)
      .on('error', reject)
      .on('finish', () => {
        logFinish(config.image.outputPath)
        resolve()
      })
  })
}

export default draw
