
import storage from '../app/storage/index.js'

export const solved = async (order:number, folder:string) => {
  const results = await storage.read.metadata(folder)

  const maxCurrentOrder = results
    .filter(result => result.order === order)  
    .reduce((acc, curr) => {
      return curr.coeff > acc
        ? curr.coeff
        : acc
      }, 1)

  return maxCurrentOrder + 1
} 
