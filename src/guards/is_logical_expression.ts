import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type LogicalExpression = TSESTree.LogicalExpression

export function guardLogicalExpression(
  node: Node,
  operator?: string
): node is LogicalExpression {
  return (
    node.type === AST_NODE_TYPES.LogicalExpression &&
    (operator === undefined || node.operator === operator)
  )
}

/**
 * @deprecated use guardLogicalExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isLogicalExpression = guardLogicalExpression
