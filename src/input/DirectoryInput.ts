import { FileInput } from './FileInput'

import nodePath from 'path'
import { readDir } from '../utils/fs'
import {
  configurationFilePattern,
  fileExtensions,
  testFilePattern,
  Input,
} from './Input'

export class DirectoryInput implements Input {
  constructor(
    private readonly path: string,
    private readonly exerciseSlug: string
  ) {}

  public async read(n = 1, preferredExtension = 'js'): Promise<string[]> {
    const files = await readDir(this.path)

    const candidates = findCandidates(
      files,
      n,
      `${this.exerciseSlug}.${preferredExtension}`
    )
    const fileSources = await Promise.all(
      candidates.map(
        (candidate): Promise<string> => {
          return new FileInput(nodePath.join(this.path, candidate))
            .read()
            .then(([source]): string => source)
        }
      )
    )

    return fileSources
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
  ...preferredNames: string[]
): string[] {
  const candidates = files
    .filter((file): boolean => fileExtensions.test(file))
    .filter((file): boolean => !testFilePattern.test(file))
    .filter((file): boolean => !configurationFilePattern.test(file))

  const preferredMatches = preferredNames
    ? candidates.filter((file): boolean => preferredNames.includes(file))
    : []

  const allMatches =
    preferredMatches.length >= n
      ? preferredMatches
      : preferredMatches.concat(
          candidates.filter((file): boolean => !preferredMatches.includes(file))
        )

  return allMatches.slice(0, n)
}
