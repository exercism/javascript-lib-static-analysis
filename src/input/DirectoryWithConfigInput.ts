import { FileInput } from './FileInput'
import { getTrackOptions, Input } from './Input'

import fs from 'node:fs'
import path from 'node:path'

export interface MetaConfiguration {
  blurb: string
  authors?: PersonReference[]
  contributors?: PersonReference[]
  files: {
    solution: string[]
    test: string[]
    exemplar?: string[]
    example?: string[]
  }
  forked_from?: string[]
}

export type PersonReference = {
  github_username: string
  exercism_username: string
}

export class DirectoryWithConfigInput implements Input {
  /**
   * Test that the directory contains a meta configuration with a valid files
   * configuration.
   *
   * @param directory the directory to test
   * @returns true if it's valid
   */
  public static test(directory: string): boolean {
    const pathName = path.join(directory, '.meta', 'config.json')
    if (!fs.existsSync(pathName)) {
      return false
    }

    const config = JSON.parse(
      fs.readFileSync(pathName).toString()
    ) as MetaConfiguration

    return (
      'files' in config &&
      config.files.solution &&
      config.files.solution.length > 0 &&
      config.files.test &&
      config.files.test.length > 0
    )
  }

  private configuration: MetaConfiguration
  private trackOptions = getTrackOptions()

  constructor(private readonly directory: string) {
    const pathName = path.join(directory, '.meta', 'config.json')

    this.configuration = JSON.parse(
      fs.readFileSync(pathName).toString()
    ) as MetaConfiguration
  }

  public async files(
    n = this.configuration.files.solution.length
  ): Promise<FileInput[]> {
    const candidates = this.configuration.files.solution.slice(0, n)

    return await Promise.all(
      candidates.map(
        (candidate) =>
          new FileInput(path.join(this.directory, candidate), this.trackOptions)
      )
    )
  }

  public async read(
    n = this.configuration.files.solution.length
  ): Promise<string[]> {
    const candidates = await this.files(n)

    return await Promise.all(
      candidates.map(async (candidate) => {
        const [source] = await candidate.read()
        return source
      })
    )
  }
}
