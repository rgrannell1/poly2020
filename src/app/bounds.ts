
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
 * @param order the order of the polynomial. Note these polynomials are monic, so 
 *   one their terms are ignored and order 3 will be in fact 4. 
 */
export const calculate = (solutionCount:number, order:number) => {
  return Math.ceil(Math.pow(solutionCount, 1 / order) / 2)
}
