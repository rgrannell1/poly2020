
import * as storage from '../../app/storage.js'

interface MetadataEntry {
  count: number,
  order: number,
  coeff: number
}

const show = async () => {
  const results = await storage.readMetadata('data')

  const totalCount = results.reduce((acc:number, curr:MetadataEntry) => {
    return acc + curr.count
  }, 0)

  console.log(totalCount)
}

export default show
