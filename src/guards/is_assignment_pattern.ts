import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { isIdentifier } from './is_identifier'
import { isLiteral } from './is_literal'

type Node = TSESTree.Node
type AssignmentPattern = TSESTree.AssignmentPattern

export function isAssignmentPattern(node: Node, value?: string): node is AssignmentPattern {
  return (
    node.type === AST_NODE_TYPES.AssignmentPattern &&
    (value === undefined ||
      (node.right !== undefined && (isLiteral(node.right, value) || isIdentifier(node.right, value))))
  )
}
