
import stream from 'stream'
import BinaryTranscoder from './binary-transcoder.js'
import {
  PixelGenerator
} from '../../commons/types'

import {
  WRITE_SOLUTION_BUFFER_SIZE
} from '../../commons/constants.js'

/**
 * Convert an iterator of x,y coordinates into a iterator of binary-encoded coordinates. Filter
 * out repeated coordinates to save space when writing. Note this is memory-inefficient but bloom-filters
 * were worse when tested.
 * 
 * @param iter 
 * @param transcoder 
 */
export const encodePixelsAsBinary = function * (iter:PixelGenerator, transcoder:BinaryTranscoder) {
  let filter:Set<String> = new Set()

  for (const stretch of iter) {
    if (!stretch) {
      continue
    }
    const unique = []

    for (const coord of stretch) {
      if (!coord) {
        yield
      } else {
        const x = coord.x
        const y = coord.y
        const key = `${x}${y}`
    
        if (!filter.has(key)) {
          filter.add(key)
          unique.push(x, y)
        }
      }
    }  

    const buffer = Buffer.alloc(2 * 2 * unique.length)

    let idx = 0
    for (const num of unique) {
      idx = buffer.writeUInt16BE(num, idx)
    }

    yield buffer
  }
}

// TODO check if this should be [string, string]
type EncodedIter = Generator<Buffer, void, unknown>

interface ReaderData {
  count: number,
  reader?: stream.Readable
}

/**
 * Convert an iterator of binary-encoded [x, y] arrays to a ReadStream.
 * 
 * @param binaryPixels an iterator of binary-encoded [x, y] arrays
 */
export const binaryPixelsAsReadStream = (binaryPixels:EncodedIter):ReaderData => {  
  const readerData:ReaderData = {
    count: 0
  } 
  
  const reader = new stream.Readable({
    encoding: undefined,
    read() {
      for (let buff of binaryPixels) {
        if (!buff) {
          continue
        }

        readerData.count += BinaryTranscoder.count(buff, 2)
        this.push(buff)        
      }

      this.push(null)
    }
  })

  readerData.reader = reader

  return readerData
}
