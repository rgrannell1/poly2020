
import stream from 'stream'
import BinaryTranscoder from './binary-transcoder'
import {
  TileGenerator
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
export const encodeTilesAsBinary = function * (iter:TileGenerator, transcoder:BinaryTranscoder) {
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

// TODO check if this should be [string, string]
type EncodedIter = Generator<[number, number], void, unknown>
type EncodedBufferIter = Generator<Buffer | undefined, void, unknown>

/**
 * Receive a generator of binary-encoded xy pairs, and yield binary-buffers
 * containing data to store. 
 * 
 * @param iter the iterator yielding 
 * @param opts 
 */
export const encodeBinaryTilesAsBuffer = function * (iter:EncodedIter):EncodedBufferIter {
  let parts = []
  
  for (const coord of iter) {
    if (coord) {
      parts.push(coord[0], coord[1])

      if (parts.length > WRITE_SOLUTION_BUFFER_SIZE) {
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

/**
 * Convert an iterator of binary-encoded [x, y] arrays to a ReadStream.
 * 
 * @param binaryTiles an iterator of binary-encoded [x, y] arrays
 */
export const binaryTilesAsReadStream = (binaryTiles:EncodedIter):ReaderData => {  
  const readerData:ReaderData = {
    count: 0
  } 

  const bufferIter = encodeBinaryTilesAsBuffer(binaryTiles)
  const reader = new stream.Readable({
    encoding: undefined,
    read() {
      for (let elem of bufferIter) {
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
