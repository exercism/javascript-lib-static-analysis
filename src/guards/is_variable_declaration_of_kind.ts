import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
export type VariableKind = TSESTree.VariableDeclaration['kind']

export type VariableDeclarationOfKind<
  T extends VariableKind
> = TSESTree.VariableDeclaration & { kind: T }

export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['var']
): node is VariableDeclarationOfKind<'var'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['const', 'var'] | readonly ['var', 'const']
): node is VariableDeclarationOfKind<'const' | 'var'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['const']
): node is VariableDeclarationOfKind<'const'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds:
    | readonly ['let', 'const', 'var']
    | readonly ['let', 'var', 'const']
    | readonly ['const', 'let', 'var']
    | readonly ['const', 'var', 'let']
    | readonly ['var', 'let', 'const']
    | readonly ['var', 'const', 'let']
): node is VariableDeclarationOfKind<'let' | 'const' | 'var'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['let', 'var'] | readonly ['var', 'let']
): node is VariableDeclarationOfKind<'let' | 'var'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['let', 'const'] | readonly ['const', 'let']
): node is VariableDeclarationOfKind<'let' | 'const'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly ['let']
): node is VariableDeclarationOfKind<'let'>
export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly VariableKind[]
): node is VariableDeclarationOfKind<VariableKind>

export function guardVariableDeclarationOfKind(
  node: Node,
  kinds: readonly VariableKind[]
): node is VariableDeclarationOfKind<VariableKind> {
  if (
    node.type !== AST_NODE_TYPES.VariableDeclaration ||
    !kinds.includes(node.kind)
  ) {
    return false
  }

  return true
}

/**
 * @deprecated use guardVariableDeclarationOfKind because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isVariableDeclarationOfKind = guardVariableDeclarationOfKind
