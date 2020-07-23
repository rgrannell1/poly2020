
import docopt from 'docopt'
import poly from '../app/poly.js'

const doc = `
Usage:
  poly --config <fpath> --name <name>

Description:
  Polynomial is a CLI tool that plots the solution to large numbers of polynomials, to create
  beautiful fractal images.

Authors:
	Róisín Grannell

Options:
  --config <fpath>  A configuration file-path. See below for more details.
  --name <name>     The section of the configuration to use
  -h, --help        Show this documentation.
  
Configuration:

  The following section describes the expected format of the provided configuration file. An example is included
  in this repository's example folder.

  {
    // -- templates is optional, but can include configuration to be overwriten-by-merge
    // -- in the "jobs" section.
    "templates": {
      "default": {
        "polynomial": {
          // -- mandatory: the order of the equation to solve
          "order": 5,
          // -- mandatory: the minimum number of solutions to generate. Note this will most likely be exceeded.
          "count": 100000
        },
        "image": {
          "outputPath": "example.png",
          // -- mandatory: the resolution of the output image.
          "resolution": 1000,
          // -- mandatory: the bounds of the argand diagram. Recommended to be -10, 10 or more zoomed in.
          "bounds": {
            "x": [-1, 1],
            "y": [-1, 1]
          }
        }
      }
    },
    // -- jobs is mandatory, it describes how many equations to solve and how to output an image
    "jobs": {
      "large": {
        // -- "template" describes which template to merge from.
        "template": "default",
        "image": {
          // -- "resolution" overwrites the template resolution for this job
          "resolution": 2000
        },
        "small": {
          "template": "default",
          "image": {
            "resolution": 500
          }
        }
      }
    } 
  }

  Author:
    Róisín Grannell <r.grannell2@gmail.com>

  Version:
    v0.1.0

  License:
  The MIT License

  Copyright (c) 2020 Róisín Grannell

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without 
  limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
  the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
  LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
  SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
  CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
  DEALINGS IN THE SOFTWARE.
`

const args = docopt.docopt(doc, { })

poly(args)
