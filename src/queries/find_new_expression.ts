import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import { findFirst } from './find_first'
import { guardIdentifier } from '../guards/is_identifier'

type Node = TSESTree.Node
type NewExpression = TSESTree.NewExpression
type NewExpressionWithName<T extends string> = NewExpression & {
  callee: TSESTree.Identifier & { name: T }
}

export function isNewExpression(node: Node): node is NewExpression
export function isNewExpression<T extends string>(
  node: Node,
  className: T
): node is NewExpressionWithName<T>
export function isNewExpression<T extends string>(
  node: Node,
  className?: T
): node is NewExpression {
  return (
    node.type === AST_NODE_TYPES.NewExpression &&
    (!className || guardIdentifier(node.callee, className))
  )
}

export function findNewExpression<T extends string>(
  root: Node,
  className: T
): NewExpressionWithName<T> | undefined {
  const isNewClass = (node: Node): node is NewExpressionWithName<T> =>
    isNewExpression(node) && guardIdentifier(node.callee, className)
  return findFirst(root, isNewClass)
}
