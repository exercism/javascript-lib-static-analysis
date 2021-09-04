import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { guardLiteral } from '../guards/is_literal'

type Node = TSESTree.Node
type Literal = TSESTree.Literal

export function findRawLiteral(root: Node, raw: string): Literal | undefined {
  const isLiteralValue = (node: Node): node is Literal =>
    guardLiteral(node) && node.raw === raw
  return findFirst(root, isLiteralValue)
}
