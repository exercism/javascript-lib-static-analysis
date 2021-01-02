import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type UnaryExpression = TSESTree.UnaryExpression

export function isUnaryExpression(node: Node, operator?: string): node is UnaryExpression {
  return node.type === AST_NODE_TYPES.UnaryExpression && (operator === undefined || node.operator === operator)
}
