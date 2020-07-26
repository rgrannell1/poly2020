
import stream from 'stream'
import lzma from 'lzma-native'
import mergeStream from 'merge-stream'
import * as fs from 'fs'
import * as path from 'path'

import BT from './storage/binary-transcoder'

import {
  BinGenerator
} from '../commons/types'

export const BinaryTranscoder = BT

// -- tune this.
const COORD_REPEATS = 1024 * 2

type EncodedIter = Generator<[number, number], void, unknown>
type EncodedBufferIter = Generator<Buffer | undefined, void, unknown>

/**
 * Receive a generator of binary-encoded pairs, and yield binary-buffers
 * containing data to store. 
 * 
 * @param iter the iterator yielding 
 * @param opts 
 */
const encodedCoordsAsBuffer = function * (iter:EncodedIter, opts:Object):EncodedBufferIter {
  let parts = []
  
  for (const coord of iter) {
    if (coord) {
      parts.push(coord[0], coord[1])

      if (parts.length > COORD_REPEATS) {
        yield Buffer.from(parts.join(''), 'binary')
        parts = []
      }
    } else {
      yield
    }
  }
}

interface ReaderData {
  count: number,
  reader?: stream.Readable
}

export const writeBinary = (iter:any, opts:Object) => {
  const readerData:ReaderData = {
    count: 0
  } 

  const chunkIter = encodedCoordsAsBuffer(iter, opts)

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

/**
 * Write metadata to a file
 * 
 * @param fpath the path to output the metadata to
 * @param data the data to store
 * 
 * @returns a promise
 */
export const writeMetadata = (fpath:string, data:WriteMetadataOpts) => {
  const stringify = JSON.stringify(data, null, 2)

  return fs.promises.writeFile(fpath, stringify)
}

/**
 * Write solutions (encoded as LZMA-compressed binary data) and associated metadata to a pair of files.
 * 
 * @param filterIter 
 * @param opts 
 */
export const write = async (filterIter:any, opts:WriteOpts) => {
  const readerData = writeBinary(filterIter, { })
  const writer = fs.createWriteStream(opts.storagePath, {
    encoding: 'binary'
  })

  // -- wait for all data to be written before writing metadata.
  const writtenCount = await new Promise((resolve, reject) => {
    if (typeof readerData.reader === 'undefined') {
      throw new Error('reader was not defined.')
    }

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

  if (writtenCount === 0) {
    return
  }

  // -- write metadata after so we can assume the data files are complete
  await writeMetadata(opts.metadataPath, {
    coeff: opts.coeff,
    order: opts.order,
    count: writtenCount
  })
}

/**
 * Read all metadata files from a folder.
 * 
 * @param folder 
 */
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

/**
 * Read solutions an yield them asyncronously
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
    const readStream = fs.createReadStream(path.join(folder, target), { 
      highWaterMark: COORD_REPEATS * 8
    }).pipe(lzma.createDecompressor())

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

export const uniqueAsBinary = function * (iter:BinGenerator, transcoder:BT) {
  let filter:Set<String> = new Set()

  for (const coord of iter) {
    if (!coord) {
      yield
    } else {
      const xp = transcoder.encode(coord.x)
      const yp = transcoder.encode(coord.y)
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
