import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type TemplateLiteral = TSESTree.TemplateLiteral

export function isTemplateLiteral(
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
