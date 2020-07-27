
import * as fs from 'fs'
import * as zeros from 'zeros'
import * as pixels from 'save-pixels'

import storage from '../../app/storage/index.js'
import * as configModule from '../../app/config.js'

const draw = async (rawArgs:any) => {
  const configPath = rawArgs['--config']
  const name = rawArgs['--name']

  const config = await configModule.load(configPath, name)
  const solutions = await storage.read.solutions(config.polynomial.order, 'data')

  const image = zeros.default([10_000, 10_000, 4])

  for (let ith = 0; ith < 10_000; ++ith) {
    for (let jth = 0; jth < 10_000; ++jth) {
      image.set(ith, jth, 0, 0)
      image.set(ith, jth, 1, 0)
      image.set(ith, jth, 2, 0)
      image.set(ith, jth, 3, 255)
    }  
  }

  let ith = 0
  for await (const {x, y} of solutions) {
    ith++
    image.set(x, y, 0, 255)
    image.set(x, y, 1, 255)
    image.set(x, y, 2, 255)
    image.set(x, y, 3, 255)
  }
  
  const writeStream = fs.createWriteStream('v2.png')
  pixels.default(image, 'png')
    .pipe(writeStream)

  return
}

export default draw
