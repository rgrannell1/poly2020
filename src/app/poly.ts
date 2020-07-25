
import solve from '../app/commands/solve.js'
import show from '../app/commands/show.js'

interface RawPolyArgs {
  "--config": string,
  "--name": string,
  show: Boolean
}

/**
 * The core application
 * 
 * @param rawArgs arguments provided by the CLI interface 
 */
const poly = async (rawArgs:RawPolyArgs) => {
  if (rawArgs.show) {
    await show()
  } else {
    await solve(rawArgs)
  }
}

export default poly
