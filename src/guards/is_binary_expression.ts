import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type BinaryExpression = TSESTree.BinaryExpression
export type BinaryOperator = BinaryExpression['operator']
export type BinaryExpressionWithOperator<
  T extends BinaryOperator
> = BinaryExpression & { operator: T }

export function guardBinaryExpression(node: Node): node is BinaryExpression
export function guardBinaryExpression<T extends BinaryOperator>(
  node: Node,
  operator: T
): node is BinaryExpressionWithOperator<T>
export function guardBinaryExpression(
  node: Node,
  operator?: string
): node is BinaryExpression {
  return (
    node.type === AST_NODE_TYPES.BinaryExpression &&
    (operator === undefined || node.operator === operator)
  )
}

/**
 * @deprecated use guardBinaryExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isBinaryExpression = guardBinaryExpression
