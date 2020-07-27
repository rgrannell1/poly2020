
import BinaryTranscoder from './binary-transcoder.js'

import {
  readMetadata,
  readSolutions,
  readStartCoefficient,
  readSolvedCount
} from './read.js'

import {
  writeSolutions,
  writeMetadata
} from './write.js'

import {
  encodePixelsAsBinary
} from './transform.js'

const read = {
  metadata: readMetadata,
  solutions: readSolutions,
  startCoefficient: readStartCoefficient,
  solvedCount: readSolvedCount
}

const write = {
  solutions: writeSolutions,
  metadata: writeMetadata
}

const transform = {
  encodePixelsAsBinary: encodePixelsAsBinary
}

const storage = {
  BinaryTranscoder,
  read,
  write,
  transform
}

export default storage
