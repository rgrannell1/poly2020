
export interface Tile {
  x: number,
  y: number
}


// -- project onto grid
export interface Grid {
  xBins: number
  yBins: number
  xBounds: [number, number],
  yBounds: [number, number]
}

/**
 * Solutions are a pair of numbers representing the real and imaginary component of
 * the solution respectively.
 */
export type Solution = [number, number]

/**
 * Configuration section
 */
export interface ConfigSection {
  order: number
  count: number
  resolution: number
}

export type RootGenerator = Generator<number[][], void, undefined>
export type BinGenerator = Generator<Tile | undefined, void, unknown>

