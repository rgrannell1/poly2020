
import * as path from 'path'
import * as fs from 'fs'
import deepmerge from 'deepmerge'

/**
 * Load and validate configuration for this program
 * 
 * @param configPath the path to the configuration
 * @param name the named section inside this configuration
 */
export const load = async (configPath:string, name:string) => {
  let configs
  
  try {
    const fpath = path.join(process.cwd(), 'config.json')
    const fcontent = await fs.promises.readFile(fpath)
    configs = JSON.parse(fcontent.toString())
  } catch (err) {
    throw new Error(`failed to load ${configPath} as JSON`)
  }

  const config = configs.jobs[name]

  if (config.template) {
    const parent = configs.templates[config.template]
    return deepmerge(parent, config)
  } else {
    return config
  }
}
