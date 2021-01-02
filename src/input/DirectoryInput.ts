import { FileInput } from './FileInput'

import nodePath from 'path'
import { readDir } from '../utils/fs'
import { Input, TrackOptions, getTrackOptions } from './Input'

export class DirectoryInput implements Input {
  constructor(
    private readonly path: string,
    private readonly exerciseSlug: string,

    private trackOptions = getTrackOptions()
  ) {}

  public async read(n = 1, preferredExtension = 'js'): Promise<string[]> {
    const files = await readDir(this.path)

    const candidates = findCandidates(
      files,
      n,
      `${this.exerciseSlug}.${preferredExtension}`,
      this.trackOptions
    )

    return await Promise.all(
      candidates.map(
        async (candidate): Promise<string> => {
          const [source] = await new FileInput(
            nodePath.join(this.path, candidate),
            this.trackOptions
          ).read()
          return source
        }
      )
    )
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
}

/**
 * Given a list of files, finds up to n files that are not test files and have
 * an extension that will probably work with the estree analyzer.
 *
 * @param files the file candidates
 * @param n the number of files it should return
 * @param preferredNames the names of the files it prefers
 */
function findCandidates(
  files: string[],
  n: number,
  preferredName: string,
  { fileExtensions, testFilePattern, configurationFilePattern }: TrackOptions
): string[] {
  const candidates = files
    .filter((file): boolean => fileExtensions.test(file))
    .filter((file): boolean => !testFilePattern.test(file))
    .filter((file): boolean => !configurationFilePattern.test(file))

  const preferredMatches = candidates.filter((file): boolean =>
    preferredName.includes(file)
  )

  const allMatches =
    preferredMatches.length >= n
      ? preferredMatches
      : preferredMatches.concat(
          candidates.filter((file): boolean => !preferredMatches.includes(file))
        )

  return allMatches.slice(0, n)
}
