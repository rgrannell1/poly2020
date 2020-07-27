
import * as utils from '../commons/utils.js'

export default class CoefficientSpace {
  static size (coeff:number, order:number) {
    const rangeLength = (2 * coeff) + 1
    return Math.pow(rangeLength, order)
  }

  static solutions (coeff:number, order:number) {
    return this.size(coeff, order) * (order - 1)
  }

  /**
   * 
   * Calculate the upper coefficient needed to produce approximately the 
   * correct number of solutions, for a given order of polynomial. Will be at least
   * the provided solution count, but may be greater.
   * 
   * @param solutionCount the desired number of solutions
   * @param order the order of the polynomial. 
   *   
   * @returns the bound needed to generate the required solutions
   */  
  static requiredSize(count:number, order:number) {
    for (let coeff = 0; true; ++coeff) {
      if (this.solutions(coeff, order) >= count) {
        return coeff
      }
    }
  }

  /**
   * Enumerate the edges of a hypercube of size (2 x coeff) + 1 and dimension order. In practice,
   * enumerate the spaces of coefficients to solve polynomials layer-by-layer. This makes it easier to 
   * store iteratively.
   * 
   * @param coeff the coefficient of the edges
   * @param order the order of the polynomial
   * 
   * @yields cartesian products of length order touching the edge of the hypercube.
   */
  static * enumerateEdges (coeff:number, order:number) {
    const coeffRanges = utils.repeat(() => {
      return utils.range(-coeff, +coeff)
    }, order)
  
    yield* edgeCartesian(coeffRanges)  
  }
}

/**
 * Underlying function for edgeSpace
 * 
 * Derived from https://stackoverflow.com/questions/63092750/how-can-i-efficiently-list-hyper-rectangle-edges
 * 
 * @param coeff the coefficient of the edges
 * @param order the order of the target polynomial
 * 
 * @yields cartesian products of length order touching the edge of the hypercube.
 */
const edgeCartesian = (ranges:any[]) => {
  const coordinate:any = []

  function* helper (dim:number, atBound:Boolean):any {
    if (dim >= ranges.length) {
      // -- clone coordinates and return.
      yield coordinate.slice()
      return
    }

    const range = dim == ranges.length - 1 && !atBound
      ? [ranges[0].lower, ranges[0].upper]
      : ranges[dim]
    
      for (const coeff of range) {
        coordinate[dim] = coeff
      
        let atEdge = atBound || coeff === range.lower || coeff === range.upper
        yield* helper(dim + 1, atEdge)
    }
  }
  
  return helper(0, false)
}
