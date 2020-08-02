
# Poly2020 🦜

![Example Polynomial Image](example.png)

## Stability

> 2, Evolving - This project is healthy, but might lack testing or documentation or it is prone to breaking changes

This repository is a reimplementation of:

- https://github.com/rgrannell1/polynomial 
- https://github.com/rgrannell1/pretty-poly
- https://github.com/rgrannell1/poly

I've reimplemented this several times to improve performance, with this iteration being substantially faster.

## Usage

Poly2020 accepts a config file and a name argument to specify which arguments are used to generate images.

```
poly2020 --config config.json --name default
```

This config file can be edited or have new sections added to support new graphs.

## Files

```
config.json                 configuration describing which job to run
test/*                      assorted unit-tests and utility files for testing
src/
  external.d.ts             external module definitions
  commons/
    colours.ts              colour utility functions
    types.ts                type-definitions reused across this project
    utils.ts                misc. utility functions
  cli/
    poly.ts                 the command-line definition and point-of-entry for running the project
  app/
    commands/
      draw.ts               draw the output polynomial images for the project
      metadata.ts           display metadata about the project, such as the number of solutions stored and size of outputs
      solve.ts              solve polynomials and write their solutions to a series of LZMA-compressed files
    storage/
      binary-transcoder.ts  convert pixel-positions to and from a binary format
      index.ts              the "interface" file to storage; this is imported elsewhere
      read.ts               storage read operations
      write.ts              storage write operations
      transform.ts          transform write operations
    bounds.ts               
    config.ts               read and valdiate poly configuration
    poly.ts                 accepts command-line arguments and calls underlying commands in commands/
```

## Build

Creating a flame-graph

```
npm run perf:show
```

Testing locally

```
npm run draw:default
```

Removing existing data

```
npm run clean
```

## Testing

## Installation

Poly can be installed using NPM

```
npm install github:rgrannell1/poly2020
```

## Performance 

| Solutions     | Time (2016)   | `4d753d`      |
| ------------- |:-------------:| :------------:|
| ten thousand  | 1 second      | 0.01 seconds  | 
| ten million   | 16 minutes    | 17 seconds    |
| one billion   | 1.15 days     | 30 minutes    |
| one trillion  | new laptop 🙁 | 20 days       |

## Changelog

## License

The MIT License

Copyright (c) 2020 Róisín Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
