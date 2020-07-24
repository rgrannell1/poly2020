
import * as fs from 'fs'
import * as bounds from '../app/bounds.js'

import {
  ConfigSection
} from '../commons/types'

export const ranges = async (config:ConfigSection, folder:string) => {
  const listing = await fs.promises.readdir(folder)
  const coeff = bounds.calculate(config.polynomial.count, config.polynomial.order)
  const targets = listing.filter(item => {
    return item.endsWith('metadata.json')
  })

  const results = []

  for (const target of targets) {
    const content = await fs.promises.readFile(target)

    try {
      const data = JSON.parse(content.toString())
      results.push(data)
    } catch (err) {
      throw new Error(`failed to parse "${target}"`)
    }
  }

  return [
    [1, 2]
  ]
} 
