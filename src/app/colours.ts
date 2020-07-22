
import {
  Tile
} from '../commons/types'

/**
 * Calculate a hue value
 * 
 * @param tile 
 */
export const hue = (tile:Tile):number[] => {
  const red = Math.round(Math.random() * 255)
  const green = Math.round(Math.random() * 255)
  const blue = Math.round(Math.random() * 255)
  const alpha = 128

  return [
    red, 
    green,
    blue,
    alpha
  ]
}

