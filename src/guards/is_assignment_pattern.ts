import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import { guardIdentifier } from './is_identifier'
import { guardLiteral } from './is_literal'

type Node = TSESTree.Node
export type AssignmentPattern = TSESTree.AssignmentPattern

export function guardAssignmentPattern(
  node: Node,
  value?: string
): node is AssignmentPattern {
  return (
    node.type === AST_NODE_TYPES.AssignmentPattern &&
    (value === undefined ||
      (node.right !== undefined &&
        (guardLiteral(node.right, value) ||
          guardIdentifier(node.right, value))))
  )
}

/**
 * @deprecated use guardAssignmentPattern because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isAssignmentPattern = guardAssignmentPattern
