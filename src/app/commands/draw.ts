

import * as storage from '../../app/storage/index.js'
import * as configModule from '../../app/config.js'

import {
  ConfigSection,
  RawPolyArgs
} from '../../commons/types'

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
