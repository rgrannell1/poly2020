
import lzma from 'lzma-native'
import mergeStream from 'merge-stream'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Read all metadata files from a folder.
 * 
 * @param folder 
 */
export const readMetadata = async (folder:string):Promise<any[]> => {
  const listing = await fs.promises.readdir(folder)
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

  return results
}

/**
 * Read solutions and yield them asyncronously
 * 
 * @param order the order of the polynomial
 * @param folder the folder to load data from
 * 
 * Asyncronously yields arrays of tiles
 */
export const readSolutions = async function * (order:number, folder:string) {
  const listing = await fs.promises.readdir(folder)
  const targets = listing.filter(item => {
    return item.endsWith('.bin')
  })

  for (const target of targets) {
    const readStream = fs.createReadStream(path.join(folder, target))
      .pipe(lzma.createDecompressor())

    // -- this is an ABSURD workaround for zma-native/issues/74; it makes the stream async iterable.
    const coords = []

    for await (const buffer of mergeStream(readStream)) {
      if (typeof buffer === 'string') {
        continue
      }

      for (let ith = 0; ith < (buffer.length - 32); ith += 32) {
        // -- decoding is still broken.

        let x:any = buffer.readUInt16BE(ith)
        let y:any = buffer.readUInt16BE(ith + 16)
      }
    }
  }
}

/**
 * Find the lowest unsolved range of coefficients based on a folder's metadata files
 * 
 * @param order the polynomial order
 * @param folder the folder to search for solutions in
 */
export const readStartCoefficient = async (order:number, folder:string) => {
  const results = await readMetadata(folder)

  const maxCurrentOrder = results
    .filter(result => result.order === order)  
    .reduce((acc, curr) => {
      return curr.coeff > acc
        ? curr.coeff
        : acc
      }, 1)

  return maxCurrentOrder + 1
} 
