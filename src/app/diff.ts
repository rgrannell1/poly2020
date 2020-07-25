
import * as fs from 'fs'
import * as path from 'path'
import * as bounds from '../app/bounds.js'

import {
  ConfigSection
} from '../commons/types'

export const solved = async (config:ConfigSection, folder:string) => {
  const listing = await fs.promises.readdir(folder)
  const coeff = bounds.calculate(config.polynomial.count, config.polynomial.order)
  const targets = listing.filter(item => {
    return item.endsWith('metadata.json')
  })

  const results = []

  for (const target of targets) {
    const content = await fs.promises.readFile(path.join(folder, target))

    try {
      const data = JSON.parse(content.toString())
      results.push(data)
    } catch (err) {
      throw new Error(`failed to parse "${target}"`)
    }
  }

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
