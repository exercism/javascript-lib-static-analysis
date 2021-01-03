import { TSESTree } from '@typescript-eslint/typescript-estree'

type NodeWithLocation = TSESTree.Node & {
  range?: TSESTree.Range
  loc?: TSESTree.SourceLocation
}

export function extractSource(source: string, node: NodeWithLocation): string {
  return source.substring(...node.range)
}
