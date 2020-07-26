
import * as storage from '../storage/index.js'

interface MetadataEntry {
  count: number,
  order: number,
  coeff: number
}

interface ShowSummary {
  count: number
}

/**
 * Show information about the currently stored solutions
 */
const show = async () => {
  const results = await storage.readMetadata('data')
  const agg:Map<number, ShowSummary> = new Map()

  for (const result of results) {
    const current = agg.get(result.order)

    if (current) {
      current.count += result.count
    } else {
      agg.set(result.order, {
        count: result.count
      })
    }
  }

  const sortedByOrder = [...agg.entries()].
    sort((elem0:[number, ShowSummary], elem1:[number, ShowSummary]) => {
      return elem0[0] - elem1[0]
    })

  for (const [order, xxxx] of sortedByOrder) {
    console.log(`${order}th-order equations: ${xxxx.count.toLocaleString()} solutions`)
  }
}

export default show
