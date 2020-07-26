
import BinaryTranscoder from './binary-transcoder'
import {
  BinGenerator
} from '../../commons/types'

import {
  WRITE_SOLUTION_BUFFER_SIZE
} from '../../commons/constants.js'

export const uniqueAsBinary = function * (iter:BinGenerator, transcoder:BinaryTranscoder) {
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

type EncodedIter = Generator<[number, number], void, unknown>
type EncodedBufferIter = Generator<Buffer | undefined, void, unknown>

/**
 * Receive a generator of binary-encoded pairs, and yield binary-buffers
 * containing data to store. 
 * 
 * @param iter the iterator yielding 
 * @param opts 
 */
export const encodedCoordsAsBuffer = function * (iter:EncodedIter, opts:Object):EncodedBufferIter {
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
