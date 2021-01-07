import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node

export type ReturnStatementWithValue = TSESTree.ReturnStatement & {
  argument: NonNullable<TSESTree.ReturnStatement['argument']>
}

/**
 * Checks if the node is `return ...` and not `return;`
 */
export function guardReturnStatementWithValue(
  node: Node
): node is ReturnStatementWithValue {
  return node.type === AST_NODE_TYPES.ReturnStatement && node.argument !== null
}

/**
 * @deprecated use guardReturnStatementWithValue because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isReturnStatementWithValue = guardReturnStatementWithValue
