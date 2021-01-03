import { TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { isLiteral } from '../guards/is_literal'

type Node = TSESTree.Node
type Literal = TSESTree.Literal

export function findRawLiteral(root: Node, raw: string): Literal | undefined {
  const isLiteralValue = (node: Node): node is Literal =>
    isLiteral(node) && node.raw === raw
  return findFirst(root, isLiteralValue) as Literal | undefined
}
