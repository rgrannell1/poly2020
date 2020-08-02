
import { PassThrough }  from 'stream'
import Compressor from './compressor.js'
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
 * Asyncronously yields arrays of pixels
 */
export const readSolutions = async function * (order:number, folder:string) {
  const results = await readMetadata(folder)
   const targets = results.map(item => {
    return item.storagePath
  })

  const compress = new Compressor('brotli')

  for (const target of targets) {
    const readStream = fs.createReadStream(target)
      .on('error', err => {
        throw err
      })
      .pipe(compress.decompress())

    for await (const buffer of readStream) {
      let idx = 0
      while (idx < (buffer.length - 4)) {
        let x = buffer.readUInt16BE(idx)
        let y = buffer.readUInt16BE(idx + 2)
        idx += 4

        yield {x, y}
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

export const readSolvedCount = async (order:number, folder:string) => {
  const results = await readMetadata(folder)

  return results
    .filter(result => result.order === order)  
    .reduce((acc, curr) => {
      return acc + curr.count 
    }, 0)
}

export const readSolvedBytes = async (order:number, folder:string) => {
  const results = await readMetadata(folder)

  return results
    .filter(result => result.order === order)  
    .reduce((acc, curr) => {
      return acc + curr.size.b
    }, 0)
} 