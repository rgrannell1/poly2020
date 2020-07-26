
import BT from './binary-transcoder.js'
import {
  readMetadata,
  readSolutions,
  readStartCoefficient
} from './read.js'

import {
  writeSolutions,
  writeMetadata
} from './write.js'

import {
  uniqueAsBinary
} from './transform.js'

const read = {
  metadata: readMetadata,
  solutions: readSolutions,
  startCoefficient: readStartCoefficient
}

const write = {
  solutions: writeSolutions,
  metadata: writeMetadata
}

const transform = {
  uniqueAsBinary: uniqueAsBinary
}

const storage = {
  BinaryTranscoder: BT,
  read,
  write,
  transform
}

export default storage
