import { Socket } from "dgram"

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
