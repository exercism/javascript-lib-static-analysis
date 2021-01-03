import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'

type Node = TSESTree.Node
type ReturnStatement = TSESTree.ReturnStatement
type BlockStatement = TSESTree.BlockStatement

type BlockWithReturnStatement = BlockStatement & { body: [ReturnStatement] }

export function isReturnBlockStatement(
  node: Node
): node is BlockWithReturnStatement {
  return (
    node.type === AST_NODE_TYPES.BlockStatement &&
    node.body.length === 1 &&
    node.body[0].type === AST_NODE_TYPES.ReturnStatement
  )
}
