
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

interface PolynomialConfig {
  order: number
  count: number
}

interface BoundsConfig {
  x: [number, number],
  y: [number, number]
}

interface ImageConfig {
  resolution: number
  outputPath: string
  bounds: BoundsConfig
}

/**
 * Configuration section
 */
export interface ConfigSection {
  polynomial: PolynomialConfig
  image: ImageConfig
}

export type RootGenerator = Generator<number[][], void, undefined>
export type BinGenerator = Generator<Tile | undefined, void, unknown>

