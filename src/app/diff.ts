
import * as storage from '../app/storage.js'

export const solved = async (order:number, folder:string) => {
  const results = await storage.readMetadata(folder)

  const maxCurrentOrder = results
    .filter(result => result.order === order)  
    .reduce((acc, curr) => {
      return curr.coeff > acc
        ? curr.coeff
        : acc
      }, 1)

  return maxCurrentOrder + 1
} 
