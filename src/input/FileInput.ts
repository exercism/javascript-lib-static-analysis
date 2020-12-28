import { readFile } from "../utils/fs"
import { basename } from "path"
import {
  configurationFilePattern,
  fileExtensions,
  Input,
  testFilePattern,
} from "./Input"

export class FileInput implements Input {
  public readonly fileName: string

  constructor(private readonly path: string) {
    this.fileName = basename(path)
  }

  public async read(_n = 1): Promise<string[]> {
    const buffer = await readFile(this.path)
    return [buffer.toString("utf8")]
  }

  get isTestFile(): boolean {
    return testFilePattern.test(this.path)
  }

  get isConfigurationFile(): boolean {
    return configurationFilePattern.test(this.path)
  }

  get hasExpectedExtension(): boolean {
    return fileExtensions.test(this.fileName)
  }
}
