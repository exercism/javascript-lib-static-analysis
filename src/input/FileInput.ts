import { readFile } from '../utils/fs'
import { basename } from 'path'
import type { Input, TrackOptions } from './Input'
import { getTrackOptions } from './Input'

export class FileInput implements Input {
  public readonly fileName: string

  constructor(
    private readonly path: string,
    private trackOptions: TrackOptions = getTrackOptions()
  ) {
    this.fileName = basename(path)
  }

  public async read(_n = 1): Promise<string[]> {
    const buffer = await readFile(this.path)
    return [buffer.toString('utf8')]
  }

  public set fileExtensions(next: RegExp) {
    this.trackOptions = { ...this.trackOptions, fileExtensions: next }
  }

  public set testFilePattern(next: RegExp) {
    this.trackOptions = { ...this.trackOptions, testFilePattern: next }
  }

  public set configurationFilePattern(next: RegExp) {
    this.trackOptions = { ...this.trackOptions, configurationFilePattern: next }
  }

  public get isTestFile(): boolean {
    return this.trackOptions.testFilePattern.test(this.path)
  }

  public get isConfigurationFile(): boolean {
    return this.trackOptions.configurationFilePattern.test(this.path)
  }

  public get hasExpectedExtension(): boolean {
    return this.trackOptions.fileExtensions.test(this.fileName)
  }
}
