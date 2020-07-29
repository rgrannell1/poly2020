
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
  widths: number[]

  constructor () {
    this.count = 0
    this.widths = []
  }
  async start (order:number, finalCount:number, folder:string) {
    this.startTime = Date.now()
    this.finalCount = finalCount
    
    const preSolved = await storage.read.solvedCount(order, folder)
    this.startCount = preSolved

    this.update(preSolved)
  }
  runCount() {
    return this.count - this.startCount
  }
  update (count:number) {
    this.count = count

    this.show()
  }
  elapsedSeconds () {
    return (Date.now() - this.startTime) / 1000
  }
  solvedSummary () {
    // -- show percentage complete.
    const ratio = `${this.count.toLocaleString()} / ${this.finalCount.toLocaleString()}`
    // -- todo round.
    const percentage = (this.count / this.finalCount) * 100

    return `${ratio} (${percentage}%)`
  }
  timeRatio () {
    const elapsed = this.elapsedSeconds()
    const elapsedTime = formatTime(Math.floor(elapsed))

    const hz = this.runCount() / elapsed
    const remainingSeconds = Math.ceil((this.finalCount - this.startCount) / hz)

    const remainingTime = formatTime(remainingSeconds)
    return `[${elapsedTime}] / [${remainingTime}]`    
  }
  show () {
    const solvedSummary = this.solvedSummary()
    const timeRatio = this.timeRatio()

    const solvedPerSecond = Math.floor(this.runCount() / this.elapsedSeconds())

    const secondsPerBillion = formatTime(Math.ceil(1e9 / solvedPerSecond))
    const secondsPerTrillion = formatTime(Math.ceil(1e12 / solvedPerSecond))

    const div = ' | '
    const parts = [
      `🦜 ${solvedSummary}`,
      timeRatio,
      `${solvedPerSecond.toLocaleString()}Hz [${secondsPerBillion}]1e9 [${secondsPerTrillion}]1e12`
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
