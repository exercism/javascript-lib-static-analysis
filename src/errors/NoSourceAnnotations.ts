import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AnalysisError } from './AnalysisError'
import { WRONG_ANALYZER_FOR_METHOD } from './codes'

type Node = TSESTree.Node

export class NoSourceAnnotations extends AnalysisError {
  public readonly code: typeof WRONG_ANALYZER_FOR_METHOD

  constructor(public readonly node: Node) {
    super(
      `Cannot extract source from ${
        node.type
      } node. Expected node.range to be filled, actual ${
        node.range
      } (${typeof node.range}).`
    )

    Error.captureStackTrace(this, this.constructor)

    this.code = WRONG_ANALYZER_FOR_METHOD
  }
}
