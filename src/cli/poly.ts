
import docopt from 'docopt'
import poly from '../app/poly.js'

const doc = `
Usage:
  poly --config <fpath> --name <name>

Description:
  Plot an argand diagram of polynomial solutions.

Options:
	-h, --help    Show this documentation.`

const args = docopt.docopt(doc, { })

poly(args)
