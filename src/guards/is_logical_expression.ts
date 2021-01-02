import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type LogicalExpression = TSESTree.LogicalExpression

export function isLogicalExpression(node: Node, operator?: string): node is LogicalExpression {
  return node.type === AST_NODE_TYPES.LogicalExpression && (operator === undefined || node.operator === operator)
}
