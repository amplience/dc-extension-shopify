import chalk from 'cli-color'

export const info = (message) => chalk.bold.white.bgBlue(`[${message}]`)
export const success = (message) => chalk.bold.white.bgGreen(`[${message}]`)
export const error = (message) => chalk.bold.white.bgRed(`[${message}]`)
