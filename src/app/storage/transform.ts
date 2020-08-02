
import stream from 'stream'
import {
  PixelGenerator,
  ReaderData
} from '../../commons/types'

/**
 * Convert an iterator of x,y coordinates into a iterator of binary-encoded coordinates. Filter
 * out repeated coordinates to save space when writing. Note this is memory-inefficient but bloom-filters
 * were worse when tested.
 * 
 * @param iter 
 */
export const encodePixelsAsBinary = function * (iter:PixelGenerator) {
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
    
        // NOTE there was an undefined-ish error after billions of entries
        if (typeof x === 'undefined' || typeof y === 'undefined') {
          continue
        }

        if (!filter.has(key)) {
          filter.add(key)
          unique.push(x, y)          
        }
      }
    }  

    const buffer = Buffer.alloc(2 * 2 * unique.length)

    let idx = 0
    for (const num of unique) {
      if (num < 0 || num > Math.pow(2, 16) - 1) {
        continue
      }
      idx = buffer.writeUInt16BE(num, idx)
    }

    yield buffer
  }
}

// TODO check if this should be [string, string]
type EncodedIter = Generator<Buffer, void, unknown>

/**
 * Convert an iterator of binary-encoded [x, y] arrays to a ReadStream.
 * 
 * @param binaryPixels an iterator of binary-encoded [x, y] arrays
 */
export const binaryPixelsAsReadStream = (binaryPixels:EncodedIter):ReaderData => {  
  const readerData:ReaderData = {
    count: 0,
    readBytes: 0,
    compressedBytes: 0
  } 
  
  const reader = new stream.Readable({
    encoding: undefined,
    read() {
      for (let buff of binaryPixels) {
        if (!buff) {
          continue
        }

        readerData.readBytes += buff.length
        readerData.count += buff.length / Math.pow(2, 2)
        this.push(buff)        
      }

      this.push(null)
    }
  })

  readerData.reader = reader

  return readerData
}
