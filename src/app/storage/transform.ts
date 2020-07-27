
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
    const buffer = []

    for (const coord of stretch) {
      if (!coord) {
        yield
      } else {
        const xp = transcoder.encode(coord.x)
        const yp = transcoder.encode(coord.y)
        const key = `${xp}${yp}`
    
        if (!filter.has(key)) {
          filter.add(key)
          buffer.push([xp, yp])
        }
      }
    }  

    yield buffer
  }
}

// TODO check if this should be [string, string]
type EncodedIter = Generator<[number, number], void, unknown>
type EncodedBufferIter = Generator<Buffer[] | undefined, void, unknown>

/**
 * Receive a generator of binary-encoded xy pairs, and yield binary-buffers
 * containing data to store. 
 * 
 * @param iter the iterator yielding 
 * @param opts 
 */
export const encodeBinaryPixelsAsBuffer = function * (iter:any):EncodedBufferIter {
  let parts = []

  for (const stretch of iter) {
    const buffer = []

    for (const coord of stretch) {
      if (coord) {
        parts.push(coord[0], coord[1])
  
        if (parts.length > WRITE_SOLUTION_BUFFER_SIZE) {
          buffer.push(Buffer.from(parts.join(''), 'binary'))
          parts = []
        }
      } else {
        yield
      }
    }  

    yield buffer
  } 
}

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
  
  const bufferIter = encodeBinaryPixelsAsBuffer(binaryPixels)
  const reader = new stream.Readable({
    encoding: undefined,
    read() {
      for (let stretch of bufferIter) {
        if (!stretch) {
          continue
        }
        
        for (let buff of stretch) {
          if (!buff) {
            continue
          }
  
          readerData.count += BinaryTranscoder.count(buff, 2)
          this.push(buff)
        }  
      }

      this.push(null)
    }
  })

  readerData.reader = reader

  return readerData
}
