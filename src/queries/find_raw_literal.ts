import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { guardLiteral } from '../guards/is_literal'

type Node = TSESTree.Node
type Literal = TSESTree.Literal

export function findRawLiteral<R = string>(
  root: Node,
  raw: R
): Literal | undefined {
  const isLiteralValue = (node: Node): node is Literal & { raw: R } =>
    guardLiteral(node) && node.raw === raw
  return findFirst(root, isLiteralValue) as Literal | undefined
}
