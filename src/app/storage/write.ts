
import lzma from 'lzma-native'
import * as fs from 'fs'

interface WriteOpts {
  storagePath: string,
  metadataPath: string,
  coeff: number,
  order: number
}

import * as transform from './transform.js'

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
 * @param binarySolutions 
 * @param opts
 * 
 * @return a result promise
 */
export const writeSolutions = async (binarySolutions:any, opts:WriteOpts) => {
  const readerData = transform.binaryTilesAsReadStream(binarySolutions)
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
