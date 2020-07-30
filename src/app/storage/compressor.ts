
import * as zlib from 'zlib'
import * as stream from 'stream'
import { PassThrough, Transform } from 'stream'
import * as util from 'util'

const byteCounter = (key:string, state:any) => {
  return new stream.Transform({
    transform (chunk:Buffer | string, encoding:string, callback:Function) {
      // -- dirty
      if (state.hasOwnProperty(key)) {
        state[key] += chunk.length
      } else {
        state[key] += 0
      }
  
      this.emit('progress')
      callback()
    } 
  })
}



export default class Compressor {
  compressor: any
  decompressor: any
  constructor (method:string) {
    // -- allow ENV variables to toggle off compression.
     if (process.env.COMPRESS_OFF) {
      this.compressor = () => new PassThrough()
      this.decompressor = () => new PassThrough()
    } else if (method === 'brotli') {
      this.compressor = zlib.createBrotliCompress
      this.decompressor = zlib.createBrotliDecompress
    }
  }
  compress (state:any) {
    return byteCounter('before', state)
      .pipe(this.compressor())
      .pipe(byteCounter('after', state))
  }
  decompress () {
    return this.decompressor()
  }
}
