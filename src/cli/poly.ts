
import pkg from 'docopt'
const { docopt } = pkg

import poly from '../app/poly.js'

const doc = `
Usage:
  poly --config <fpath> --name <name>
`

const args = docopt(doc, { })

poly(args)

