import { TSESTree } from '@typescript-eslint/typescript-estree'
import { NoSourceAnnotations } from '../errors'

type NodeWithLocation = TSESTree.Node & {
  range?: TSESTree.Range
  loc?: TSESTree.SourceLocation
}

export function extractSource(source: string, node: NodeWithLocation): string {
  if ('range' in node && node.range.length >= 2) {
    return source.substring(...node.range)
  }

  throw new NoSourceAnnotations(node)
}
