import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type Literal = TSESTree.Literal
type LiteralValue = string | number | boolean | RegExp | bigint | null

export function isLiteral(
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
