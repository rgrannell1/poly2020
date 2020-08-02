
import storage from '../../app/storage/index.js'

const formatTime = (measured:number):string => {
  const hours = Math.floor(measured / 3600)
  const minutes = Math.floor(measured / 60) - (hours * 60)
  const seconds = measured % 60

  return `${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds}s`
}

export default class SolveProgress {
  count: number
  finalCount: number
  startTime: number
  startCount: number
  startBytes: number
  uncompressedBytes: number
  bytes: number
  widths: number[]

  constructor () {
    this.count = 0
    this.bytes = 0
    this.widths = []
  }
  async start (order:number, finalCount:number, folder:string) {
    this.startTime = Date.now()
    this.finalCount = finalCount
    
    this.startBytes = await storage.read.solvedBytes(order, folder)
    const preSolved = await storage.read.solvedCount(order, folder)
    this.startCount = preSolved

    this.updateCount(preSolved)
  }
  currentRunCount() {
    return this.count - this.startCount
  }
  updateCount (count:number) {
    this.count = count
  }
  updateCompressedBytes (bytes:number) {
    this.bytes += bytes
  }
  setDecompressedBytes (bytes:number) {
    this.uncompressedBytes = bytes
  }
  elapsedRunSeconds () {
    return (Date.now() - this.startTime) / 1000
  }
  solvedSummary () {
    // -- show percentage complete.
    const ratio = `${this.count.toLocaleString()} / ${this.finalCount.toLocaleString()}`
    // -- todo round.
    const percentage = ((this.count / this.finalCount) * 100).toFixed(2)

    return `${ratio} (${percentage}%)`
  }
  timeRatio () {
    const elapsed = this.elapsedRunSeconds()
    const elapsedTime = formatTime(Math.floor(elapsed))

    const hz = this.currentRunCount() / elapsed
    const remainingSeconds = Math.ceil((this.finalCount - this.startCount) / hz)

    const remainingTime = formatTime(remainingSeconds)
    return `[${elapsedTime}] / [${remainingTime}]`    
  }
  compressionRatio () {
    const denom = Math.round(this.uncompressedBytes / this.bytes)

    return Number.isNaN(denom)
      ? 'shrunk ???'
      : `shrunk 1:${denom}`
  }
  show () {
    const solvedSummary = this.solvedSummary()
    const timeRatio = this.timeRatio()

    const solvedPerSecond = Math.floor(this.currentRunCount() / this.elapsedRunSeconds())
    const secondsPerBillion = formatTime(Math.ceil(1e9 / solvedPerSecond))
    const secondsPerTrillion = formatTime(Math.ceil(1e12 / solvedPerSecond))

    const div = ' | '
    const parts = [
      `🦜 ${solvedSummary}`,
      timeRatio,
      `${solvedPerSecond.toLocaleString()}Hz [${secondsPerBillion}]1e9 [${secondsPerTrillion}]1e12`,
      `${((this.startBytes + this.bytes) / 1e6).toFixed(1)}mb ${this.compressionRatio()}`
    ]

    for (let ith = 0; ith < parts.length; ++ith) {
      this.widths[ith] = Math.max(
        parts[ith].length,
        this.widths[ith] || 0
      )
    }

    const padded = parts.map((part, ith) => {
      return part.padEnd(this.widths[ith])
    })

    console.clear()
    console.log(padded.join(div))
  }
}
