
import stream from 'stream'
import lzma from 'lzma-native'
import * as fs from 'fs'

import {
  encodedCoordsAsBuffer
} from './transform.js'

// -- TODO rename
export const writeBinary = (iter:any, opts:Object) => {
  interface ReaderData {
    count: number,
    reader?: stream.Readable
  }
  
  const readerData:ReaderData = {
    count: 0
  } 

  const chunkIter = encodedCoordsAsBuffer(iter, opts)

  const reader = new stream.Readable({
    encoding: undefined,
    read() {
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
export const writeSolutions = async (filterIter:any, opts:WriteOpts) => {
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
