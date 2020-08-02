
import * as zlib from 'zlib'
import { PassThrough, Transform } from 'stream'

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
    return this.compressor()
  }
  decompress () {
    return this.decompressor()
  }
}
