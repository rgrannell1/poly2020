
import stream from 'stream'
import  lzma from 'lzma-native'
import * as fs from 'fs'
import * as path from 'path'

import {
  BinGenerator
} from '../commons/types'

{
  var encoder = new Map()
  var decoder = new Map()

  for (let ith = 0; ith < Math.pow(2, 16); ++ith) {
    let binary = ith.toString(2).padStart(16, '0')
    encoder.set(ith, binary)    
    decoder.set(binary, ith)
  }
}

const encode = (coord:number):string => {
  return encoder.get(coord)
}

const decode = (coord:string):number => {
  return decoder.get(coord)
}

interface SelectUniqueOpts {
  resolution: number
}

export const uniqueAsBinary = function * (iter:BinGenerator, opts:SelectUniqueOpts) {
  let filter:Set<String> = new Set()

  for (const coord of iter) {
    if (!coord) {
      yield
    } else {
      const xp = encode(coord.x)
      const yp = encode(coord.y)
      const key = `${xp}${yp}`
  
      if (filter.has(key)) {
        yield 
      } else {
        filter.add(key)
        yield [xp, yp]
      }
    }
  }
}

const COORD_REPEATS = 128 * 2

const yieldCoordChunks = function * (iter:any, opts:Object) {
  let parts = []
  
  for (const coord of iter) {
    if (coord) {
      parts.push(coord[0])
      parts.push(coord[1])

      if (parts.length > COORD_REPEATS) {
        yield Buffer.from(parts.join(''), 'binary')
        parts = []
      }
    } else {
      yield
    }
  }
}

export const writeBinary = (iter:any, opts:Object) => {
  const readerData:any = {
    count: 0
  } 

  const chunkIter = yieldCoordChunks(iter, opts)

  const reader = new stream.Readable({
    encoding: undefined,
    read() {
      let result

      for (let elem of chunkIter) {
        if (!elem) {
          continue
        }
        readerData.count++
        this.push(elem)
      }

      this.push(null)
    }
  })

  readerData.reader = reader

  return readerData
}

interface WriteOpts {
  storagePath: string,
  metadataPath: string,
  coeff: number,
  order: number
}

interface WriteMetadataOpts {
  [key:string]: any
}

export const writeMetadata = (fpath:string, data:WriteMetadataOpts) => {
  const stringify = JSON.stringify(data, null, 2)

  return fs.promises.writeFile(fpath, stringify)
}

export const write = async (filterIter:any, opts:WriteOpts) => {
  const readerData = writeBinary(filterIter, { })
  const writer = fs.createWriteStream(opts.storagePath, {
    encoding: 'binary'
  })

  // -- wait for all data to be written before writing metadata.
  const writtenCount = await new Promise((resolve, reject) => {
    const fstream = readerData.reader
      .on('error', reject)
      .pipe(lzma.createCompressor())
      .on('error', reject)
      .pipe(writer)
      .on('error', reject)

    fstream.on('finish', () => {
      resolve(readerData.count)
    })
  })

  // -- write metadata after so we can assume the data files are complete
  await writeMetadata(opts.metadataPath, {
    coeff: opts.coeff,
    order: opts.order,
    count: writtenCount
  })
}

export const readMetadata = async (folder:string) => {
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
