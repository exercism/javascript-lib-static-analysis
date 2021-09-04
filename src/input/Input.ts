export type TrackOptions = {
  fileExtensions: RegExp
  testFilePattern: RegExp
  configurationFilePattern: RegExp
}

export const GLOBAL_TRACK_OPTIONS: TrackOptions = {
  fileExtensions: /\.(jsx?|tsx?|mjs)$/,
  testFilePattern: /\.spec|test\./,
  configurationFilePattern: /(?:babel\.config\.js|jest\.config\.js|\.eslintrc\.js)$/,
}

export function getTrackOptions(): TrackOptions {
  return { ...GLOBAL_TRACK_OPTIONS }
}

/**
 * Sets the DEFAULT file extensions globally
 * @param pattern
 */
export function setFileExtensions(pattern: RegExp): void {
  GLOBAL_TRACK_OPTIONS.fileExtensions = pattern
}

/**
 * Sets the DEFAULT test files pattern globally
 * @param pattern
 */
export function setTestFiles(pattern: RegExp): void {
  GLOBAL_TRACK_OPTIONS.testFilePattern = pattern
}

/**
 * Sets the DEFAULT configuration files pattern globally
 * @param pattern
 */
export function setConfigurationFiles(pattern: RegExp): void {
  GLOBAL_TRACK_OPTIONS.configurationFilePattern = pattern
}

export interface Input {
  /**
   * Read in a number of strings
   * @param n the number
   * @returns at most `n` strings
   */
  read: (n?: number) => Promise<string[]>
}
