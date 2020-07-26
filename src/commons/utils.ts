
/**
 * Repeatedly call a function
 * 
 * @param fn a function to invoke
 * @param count the number of repeats
 * 
 * @returns an array of repeat invokation values
 */
export const repeat = <T> (fn:() => T, count:number):T[] => {
  const output = []

  for (let ith = 0; ith < count; ++ith) {
    output[ith] = fn()
  }

  return output
}

/**
 * construct a range of numbers
 * 
 * @param lower the lower bound inclusive
 * @param upper the upper bound inclusive
 * 
 * @yields yields a number in the provided range
 */
export const range = function * (lower:number, upper:number) {
  for (let ith = lower; ith <= upper; ++ith) {
    yield ith
  }
}

export const range2 = function (lower:number, upper:number) {
  return {
    lower,
    upper,
    *[Symbol.iterator]( ) {
      for (let ith = lower; ith <= upper; ith++) {
        yield ith
      }
    }
  }
}
