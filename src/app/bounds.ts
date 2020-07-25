
import * as utils from '../commons/utils.js'
import itools from 'iter-tools'

/**
 * Calculate the number of solutions generated, given an upper bound coefficient
 * and the polynomial order.
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

/**
 * 
 * @param spaces 
 */
export const space = (coeff:number, order:number) => {
  const coeffRanges = utils.repeat(() => {
    return utils.range(-coeff, +coeff)
  }, order)

  return itools.product(...coeffRanges)
}

export const edgeSpace = function * (coeff:number, order:number) {
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

/**
 * 
 * @param spaces 
 */
export const differences = function * (space:any, spaces:any) {
  for (const coord of space) {
    yield coord
  }
}
