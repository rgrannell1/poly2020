
import chai from 'chai'

import * as storage from '../src/app/storage/binary-transcoder'

const testBinaryTranscoderOperations = () => {
  const transcoder = new storage.BinaryTranscoder(4)
  const tcases = [
    { encode: 0, decode: '0000'},
    { encode: 9, decode: '1001'}
  ]

  for (const tcase of tcases) {
    const encoding = transcoder.encode(tcase.encode)
    const decoding = transcoder.decode(tcase.decode)

    chai.expect(encoding).to.be.equal(tcase.decode)
    chai.expect(decoding).to.be.equal(tcase.encode)
  }
}

testBinaryTranscoderOperations()
