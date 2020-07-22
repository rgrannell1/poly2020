
# Poly2020
---

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

## Build

Creating a flame-graph

```
npm run perf:show
```

## Installation

Poly can be installed using NPM

```
npm install
```

## Performance

| Solutions     | Time (2016)   | Time (2020)   |
| ------------- |:-------------:| :------------:|
| ten thousand  | 1 second      | 0.05 seconds  |
| ten million   | 16 minutes    | 50 seconds    |
| one billion   | 1.15 days     | 1.4 hours     |
| one trillion  | new laptop 🙁 | 60 days       |

## Changelog

## License

The MIT License

Copyright (c) 2020 Róisín Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
