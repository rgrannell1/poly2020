
import storage from '../storage/index.js'

interface MetadataEntry {
  count: number,
  order: number,
  coeff: number
}

interface ShowSummary {
  count: number,
  mb: number,
  gb: number,
  tb: number
}

/**
 * Show information about the currently stored solutions
 */
const show = async () => {
  const results = await storage.read.metadata('data')
  const agg:Map<number, ShowSummary> = new Map()

  for (const result of results) {

    await result.storagePath

    const current = agg.get(result.order)

    if (current) {
      current.count += result.count
      current.mb += result.size.mb
      current.gb += result.size.gb
      current.tb += result.size.tb

    } else {
      agg.set(result.order, {
        count: result.count,
        mb: result.size.mb,
        gb: result.size.gb,
        tb: result.size.tb
      })
    }
  }

  const sortedByOrder = [...agg.entries()].
    sort((elem0:[number, ShowSummary], elem1:[number, ShowSummary]) => {
      return elem0[0] - elem1[0]
    })

  for (const [order, orderData] of sortedByOrder) {
    let message = `${order}th-order equations: ${orderData.count.toLocaleString()} solutions\n`
    message += `  ${orderData.mb} mb\n`
    message += `  ${orderData.gb} gb\n`
    message += `  ${orderData.tb} tb\n`
    
    console.log(message)
  }
}

export default show
