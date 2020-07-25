
import * as storage from '../app/storage.js'

import {
  ConfigSection
} from '../commons/types'

export const solved = async (config:ConfigSection, folder:string) => {
  const results = await storage.readMetadata(folder)

  // -- todo factor in order
  const maxCoeff = results.reduce((acc, curr) => {
    if (curr.coeff > acc ) {
      return curr.coeff
    } else {
      return acc
    }
  }, 1)

  return maxCoeff + 1
} 
