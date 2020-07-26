
import * as utils from '../commons/utils.js'
import itools from 'iter-tools'

/**
 * Calculate the number of solutions generated, given an upper bound coefficient
 * and the polynomial order.
 * 
 * @param count the target count
 * @param order the order of the equation
 * 
 * @returns the total number of solutions required
 */
export const totalSolutions = (count:number, order:number) => {
  const coeff = calculate(count, order)
  const rangeLength = (2 * coeff) + 1
  const totalEquations = Math.pow(rangeLength, order)

  return totalEquations * (order - 1)
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
 */
export const calculate = (solutionCount:number, order:number) => {
  if (!order) {
    throw new Error('order was invalid.')
  }

  // -- inefficient but avoids another equation.
  for (let count = 1; true; count += 1) {
    let rangeLength = count
    let totalEquations = Math.pow(rangeLength, order)
    let candidateCount = totalEquations * (order - 1)

    if (candidateCount > solutionCount) {
      return Math.ceil(count / 2) 
    }
  }
}

// -- todo performance is trash
export const edgeSpace2 = function * (coeff:number, order:number) {
  const coeffRanges = utils.repeat(() => {
    return utils.range(-coeff, +coeff)
  }, order)

  const product:any = itools.product(...coeffRanges)

  for (const coord of product) {
    let isEdge = false
    for (const subCoeff of coord) {
      if (subCoeff === -coeff || subCoeff === coeff) {
        isEdge = true
        break
      }
    }

    if (isEdge) {
      yield coord
    }
  }
}


function range(lower:number, upper:number) {
  return {
    lower,
    upper,
    *[Symbol.iterator]() {
      for (let i = lower; i <= upper; i++) yield i
    },
  }
}

const cartesian = (ranges:any[]) => {
  const coordinate:any = []

  function* helper (dim:number, atBound:Boolean):any {
    if (dim >= ranges.length) {
      // -- clone coordinates and return.
      yield coordinate.slice()
      return
    }

    const range = dim == ranges.length-1 && !atBound
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

export const edgeSpace = function * (coeff:number, order:number) {
  const coeffRanges = utils.repeat(() => {
    return utils.range2(-coeff, +coeff)
  }, order)

  yield* cartesian(coeffRanges)
}
