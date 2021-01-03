import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type ReturnStatement = TSESTree.ReturnStatement

type ReturnStatementWithValue = ReturnStatement & {
  argument: NonNullable<ReturnStatement['argument']>
}

/**
 * Checks if the node is `return ...` and not `return;`
 */
export function isReturnStatementWithValue(
  node: Node
): node is ReturnStatementWithValue {
  return node.type === AST_NODE_TYPES.ReturnStatement && node.argument !== null
}
