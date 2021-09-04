import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { guardLiteral } from '../guards/is_literal'

type Node = TSESTree.Node
type Literal = TSESTree.Literal
type LiteralValue = string | number | boolean | RegExp | null

export function findLiteral(
  root: Node,
  value: LiteralValue
): Literal | undefined {
  const isLiteralValue = (node: Node): node is Literal =>
    guardLiteral(node, value)
  return findFirst(root, isLiteralValue)
}
