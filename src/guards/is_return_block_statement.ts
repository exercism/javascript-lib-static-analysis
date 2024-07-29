import {
  AST_NODE_TYPES,
  type TSESTree,
} from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node

export type BlockWithReturnStatement = TSESTree.BlockStatement & {
  body: [TSESTree.ReturnStatement]
}

export function guardReturnBlockStatement(
  node: Node
): node is BlockWithReturnStatement {
  return (
    node.type === AST_NODE_TYPES.BlockStatement &&
    node.body.length === 1 &&
    node.body[0].type === AST_NODE_TYPES.ReturnStatement
  )
}

/**
 * @deprecated use guardReturnBlockStatement because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isReturnBlockStatement = guardReturnBlockStatement
