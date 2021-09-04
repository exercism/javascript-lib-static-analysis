import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type Literal = TSESTree.Literal
export type LiteralValue = string | number | boolean | RegExp | bigint | null

export function guardLiteral(
  node: Node,
  value?: LiteralValue,
  raw?: string
): node is Literal {
  return (
    node.type === AST_NODE_TYPES.Literal &&
    (value === undefined || node.value === value) &&
    (raw === undefined || node.raw === raw)
  )
}

/**
 * @deprecated use guardLiteral because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isLiteral = guardLiteral
