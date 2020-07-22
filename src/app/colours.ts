
import {
  Tile
} from '../commons/types'

/**
 * Calculate a hue value
 * 
 * @param tile 
 */
export const hue = (count: number, total: number):number[] => {
	let index = Math.floor((count / total) * Math.pow(255, 3))
	let blue  = (index) & 255
	let green = (index >> 8) & 255
	let red   = (index >> 16) & 255

	return [red, green, blue, 255]
}
