
/**
 * Node.js has a max set-size of 2^24 (about 16 million entries) as of 14.x. This class
 * supports arbitrarily big sets, with a minor performance hit.
 */
export default class BigSet <I> {
  private sets: Set<I>[]
  static SET_SIZE_LIMIT = Math.pow(2, 24)
  constructor (elems?:I[]) {
    this.sets = [new Set(elems)]
  }
  has (elem:I):Boolean {
    for (const set of this.sets) {
      if (set.has(elem)) {
        return true
      }
    }
    return false
  }
  add (elem:I):BigSet<I> {
    for (const set of this.sets) {
      if (set.size < BigSet.SET_SIZE_LIMIT) {
        set.add(elem)
        return this
      }
    }

    const newSet = new Set([elem])
    this.sets.push(newSet)
    return this
  }
  size ():number {
    let count = 0

    for (const set of this.sets) {
      return count += set.size
    }

    return count
  }
}
