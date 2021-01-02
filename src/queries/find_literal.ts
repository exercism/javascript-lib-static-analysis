import { TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { isLiteral } from '../guards/is_literal'

type Node = TSESTree.Node
type Literal = TSESTree.Literal
type LiteralValue = string | number | boolean | RegExp | null

export function findLiteral(root: Node, value: LiteralValue): Literal | undefined {
  const isLiteralValue = (node: Node): node is Literal => isLiteral(node, value)
  return findFirst(root, isLiteralValue)
}
