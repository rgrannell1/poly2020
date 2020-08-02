
import * as fs from 'fs'

import * as transform from './transform.js'
import Compressor from './compressor.js'
import SolveProgress from '../progress/solve-progress.js'

import {
  ReaderData
} from '../../commons/types'
import { PassThrough, Transform, Stream } from 'stream'

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

interface WriteSolutionOpts {
  storagePath: string,
  metadataPath: string,
  coeff: number,
  order: number,
  bar: SolveProgress
}

const byteCounter = (bar:any, readerData:ReaderData) => {
  return new Transform({
    transform (data:Buffer | string, encoding:string, callback:Function) {

      bar.setDecompressedBytes(readerData.readBytes)
      bar.updateCompressedBytes(data.length)

      readerData.compressedBytes += data.length
      callback(null, data)
    }
  })
}

/**
 * Write solutions (encoded as LZMA-compressed binary data) and associated metadata to a pair of files.
 * 
 * @param binarySolutions 
 * @param opts
 * 
 * @return a result promise
 */
export const writeSolutions = async (binarySolutions:any, opts:WriteSolutionOpts) => {
  const readerData = transform.binaryPixelsAsReadStream(binarySolutions)
  const writer = fs.createWriteStream(opts.storagePath, {
    encoding: 'binary'
  })

  // -- wait for all data to be written before writing metadata.
  const writtenData:ReaderData = await new Promise((resolve, reject) => {
    if (typeof readerData.reader === 'undefined') {
      throw new Error('reader was not defined.')
    }

    const compress = new Compressor('brotli')
    const fstream = readerData.reader
      .on('error', reject)
      .pipe(compress.compress(readerData))
      .pipe(byteCounter(opts.bar, readerData))
      .on('error', reject)
      .pipe(writer)
      .on('error', reject)

    fstream.on('finish', () => {
      resolve(readerData)
    })
  })

  // -- error condition.
  if (writtenData.count === 0) {
    throw new Error('no solutions written')
  }

  // -- get the size of the file
  const stat = await fs.promises.lstat(opts.storagePath)

  // -- write metadata after so we can assume the data files are complete
  await writeMetadata(opts.metadataPath, {
    coeff: opts.coeff,
    order: opts.order,
    count: writtenData.count,
    storagePath: opts.storagePath,
    size: {
      b: stat.size,
      gb: stat.size / 1e9,
      mb: stat.size / 1e6,
      tb: stat.size / 1e12  
    }
  })
}
