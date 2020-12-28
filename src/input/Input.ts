export let fileExtensions = /\.(jsx?|tsx?|mjs)$/
export let testFilePattern = /\.spec|test\./
export let configurationFilePattern = /(?:babel\.config\.js|jest\.config\.js|\.eslintrc\.js)$/

export function setFileExtensions(pattern: RegExp) {
  fileExtensions = pattern
}

export function setTestFiles(pattern: RegExp) {
  testFilePattern = pattern
}

export function setConfigurationFiles(pattern: RegExp) {
  configurationFilePattern = pattern
}

export interface Input {
  /**
   * Read in a number of strings
   * @param n the number
   * @returns at most `n` strings
   */
  read(n?: number): Promise<string[]>
}
