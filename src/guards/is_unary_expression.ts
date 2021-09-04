import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type UnaryExpression = TSESTree.UnaryExpression

export function guardUnaryExpression(
  node: Node,
  operator?: string
): node is UnaryExpression {
  return (
    node.type === AST_NODE_TYPES.UnaryExpression &&
    (operator === undefined || node.operator === operator)
  )
}

/**
 * @deprecated use guardUnaryExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isUnaryExpression = guardUnaryExpression
