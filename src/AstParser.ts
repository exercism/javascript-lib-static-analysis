import { parse as parseToTree } from '@typescript-eslint/typescript-estree'
import type { DebugLevel } from '@typescript-eslint/types'
import type { TSESTree } from '@typescript-eslint/typescript-estree'

import { NoSourceError } from './errors/NoSourceError'
import { ParserError } from './errors/ParserError'
import { Input } from './input/Input'
import { getProcessLogger } from './utils/logger'

type Program = TSESTree.Program

interface ParseOptions {
  /**
   * create a top-level comments array containing all comments
   */
  comment?: boolean
  /**
   * An array of modules to turn explicit debugging on for.
   * - 'typescript-eslint' is the same as setting the env var `DEBUG=typescript-eslint:*`
   * - 'eslint' is the same as setting the env var `DEBUG=eslint:*`
   * - 'typescript' is the same as setting `extendedDiagnostics: true` in your tsconfig compilerOptions
   *
   * For convenience, also supports a boolean:
   * - true === ['typescript-eslint']
   * - false === []
   */
  debugLevel?: DebugLevel
  /**
   * Cause the parser to error if it encounters an unknown AST node type (useful for testing).
   * This case only usually occurs when TypeScript releases new features.
   */
  errorOnUnknownASTType?: boolean
  /**
   * Absolute (or relative to `cwd`) path to the file being parsed.
   */
  filePath?: string
  /**
   * Enable parsing of JSX.
   * For more details, see https://www.typescriptlang.org/docs/handbook/jsx.html
   *
   * NOTE: this setting does not effect known file types (.js, .jsx, .ts, .tsx, .json) because the
   * TypeScript compiler has its own internal handling for known file extensions.
   *
   * For the exact behavior, see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#parseroptionsecmafeaturesjsx
   */
  jsx?: boolean
  /**
   * Controls whether the `loc` information to each node.
   * The `loc` property is an object which contains the exact line/column the node starts/ends on.
   * This is similar to the `range` property, except it is line/column relative.
   */
  loc?: boolean
  loggerFn?: ((message: string) => void) | false
  /**
   * Controls whether the `range` property is included on AST nodes.
   * The `range` property is a [number, number] which indicates the start/end index of the node in the file contents.
   * This is similar to the `loc` property, except this is the absolute index.
   */
  range?: boolean
  /**
   * Set to true to create a top-level array containing all tokens from the file.
   */
  tokens?: boolean
  useJSXTextNode?: boolean
}

export class ParsedSource {
  constructor(
    public readonly program: Program,
    public readonly source: string
  ) {}
}

export class AstParser {
  constructor(
    private readonly options?: ParseOptions,
    private readonly n = 1
  ) {}

  /**
   * Parse a files into an AST tree
   *
   * @param solution
   * @returns n programs
   */
  public async parse(input: Input): Promise<ParsedSource[]> {
    const sources = await input.read(this.n)

    const logger = getProcessLogger()

    logger.log(`=> inputs: ${sources.length}`)
    sources.forEach((source): void => logger.log(`\n${source}\n`))

    if (sources.length === 0) {
      throw new NoSourceError()
    }

    try {
      return sources.map(
        (source): ParsedSource =>
          new ParsedSource(parseToTree(source, this.options), source)
      )
    } catch (error) {
      throw new ParserError(error)
    }
  }
}
