import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { isMemberExpression } from '../guards/is_member_expression'

type Node = TSESTree.Node
type CallExpression = TSESTree.CallExpression

export const isCallExpression = (node: Node): node is CallExpression =>
  node.type === AST_NODE_TYPES.CallExpression

export function findMemberCall(
  root: Node,
  object: string,
  property: string
): CallExpression | undefined {
  const isMemberCall = (node: Node): node is CallExpression =>
    isCallExpression(node) && isMemberExpression(node.callee, object, property)
  return findFirst(root, isMemberCall) as CallExpression | undefined
}
