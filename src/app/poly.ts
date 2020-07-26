
import draw from './commands/draw.js'
import solve from '../app/commands/solve.js'
import showMetadata from './commands/metadata.js'

import {
  RawPolyArgs
} from '../commons/types'

/**
 * The core application
 * 
 * @param rawArgs arguments provided by the CLI interface 
 */
const poly = async (rawArgs:RawPolyArgs) => {
  if (rawArgs.show) {
    await showMetadata()
  } else {
    await solve(rawArgs)
    //await draw(rawArgs)
  }
}

export default poly
