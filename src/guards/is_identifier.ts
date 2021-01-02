import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type Identifier = TSESTree.Identifier

type IdentifierWithName<T extends string> = Identifier & { name: T }

export function isIdentifier<T extends string>(node: Node): node is Omit<Node, 'id'> & Identifier
export function isIdentifier<T extends string>(node: Node, name: T): node is IdentifierWithName<T>
export function isIdentifier(node: Node | null, name?: string): node is Omit<Node, 'id'> & Identifier {
  return !!node && node.type === AST_NODE_TYPES.Identifier && (name === undefined || node.name === name)
}
