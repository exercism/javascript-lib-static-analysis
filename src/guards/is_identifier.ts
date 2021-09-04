import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type Identifier = TSESTree.Identifier
export type IdentifierWithName<T extends string> = Identifier & { name: T }

export function guardIdentifier<T extends string>(
  node: Node | null
): node is Omit<Node, 'id'> & Identifier
export function guardIdentifier<T extends string>(
  node: Node | null,
  name: T
): node is IdentifierWithName<T>
export function guardIdentifier(
  node: Node | null,
  name?: string
): node is Omit<Node, 'id'> & Identifier {
  return Boolean(
    node &&
      node.type === AST_NODE_TYPES.Identifier &&
      (name === undefined || node.name === name)
  )
}

/**
 * @deprecated use guardCallExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isIdentifier = guardIdentifier
