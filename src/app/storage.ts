
import stream from 'stream'
import  lzma from 'lzma-native'
import * as fs from 'fs'

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

export const writeBinary = (iter:any, opts:Object):stream.Readable => {
  const chunkIter = yieldCoordChunks(iter, opts)

  return new stream.Readable({
    encoding: undefined,
    read() {
      let result

      for (let elem of chunkIter) {
        if (!elem) {
          continue
        }
        this.push(elem)
      }

      this.push(null)
    }
  })
}

interface WriteOpts {
  storagePath: string,
  metadataPath: string,
  ranges: number[][]
}

export const write = (filterIter:any, opts:WriteOpts) => {
  const reader = writeBinary(filterIter, { })
  const writer = fs.createWriteStream(opts.storagePath, {
    encoding: 'binary'
  })

  return new Promise((resolve, reject) => {
    const fstream = reader
      .on('error', reject)
      .pipe(lzma.createCompressor())
      .on('error', reject)
      .pipe(writer)
      .on('error', reject)

    fstream.on('finish', () => {
      resolve()
    })
  })
}
