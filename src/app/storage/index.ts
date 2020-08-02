
import {
  readMetadata,
  readSolutions,
  readStartCoefficient,
  readSolvedCount,
  readSolvedBytes
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
  solvedCount: readSolvedCount,
  solvedBytes: readSolvedBytes
}

const write = {
  solutions: writeSolutions,
  metadata: writeMetadata
}

const transform = {
  encodePixelsAsBinary: encodePixelsAsBinary
}

const storage = {
  read,
  write,
  transform
}

export default storage
