import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type TemplateLiteral = TSESTree.TemplateLiteral

export function guardTemplateLiteral(
  node: Node,
  quasis?: string[],
  _value?: string
): node is TemplateLiteral {
  return (
    node.type === AST_NODE_TYPES.TemplateLiteral &&
    (quasis === undefined ||
      node.quasis.every((q, i): boolean => quasis[i] === q.value.raw))
  )
}

/**
 * @deprecated use guardTemplateLiteral because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isTemplateLiteral = guardTemplateLiteral
