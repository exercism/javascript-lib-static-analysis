import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { CallExpression, guardCallExpression } from '../guards'
import { guardMemberExpression } from '../guards/is_member_expression'
import { findFirst } from './find_first'

type Node = TSESTree.Node

export function findMemberCall(
  root: Node,
  object: string,
  property: string
): CallExpression | undefined {
  const isMemberCall = (node: Node): node is CallExpression =>
    guardCallExpression(node) &&
    guardMemberExpression(node.callee, object, property)
  return findFirst(root, isMemberCall) as CallExpression | undefined
}
