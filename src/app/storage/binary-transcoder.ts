/**
 * Convert any tiles in range to a binary string. Since this operation will be repeated billions 
 * of times and the space is approximately 64k elements the result is memoised in a pair of maps. This
 * speeds up encoding.
 */
export class BinaryTranscoder {
  encodings: Map<number, string>
  decodings: Map<string, number>

  constructor (bits:number) {
    // -- bidirectional mappingd
    this.encodings = new Map()
    this.decodings = new Map()

    for (let ith = 0; ith < Math.pow(2, bits); ++ith) {
      let binary = ith.toString(2).padStart(bits, '0')
      this.encodings.set(ith, binary)    
      this.decodings.set(binary, ith)
    }    
  }
  /**
   * Encode a coordinate as a binary two-byte string
   * 
   * @param coord a single dimension between 0 and 2^16 - 1
   */  
  encode (coord:number):string | undefined {
    return this.encodings.get(coord)
  }
  /**
   * Decode a coordinate from a binary two-byte string
   * 
   * @param coord a binary string
   */
  decode (coord:string):number | undefined {
    return this.decodings.get(coord)
  }
}

export default BinaryTranscoder
