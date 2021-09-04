import { findAll } from './find_all'
import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import type { VariableKind } from '../guards/is_variable_declaration_of_kind'
import { guardVariableDeclarationOfKind } from '../guards/is_variable_declaration_of_kind'
import type { AstTraverser } from '../AstTraverser'

type Node = TSESTree.Node
type VariableDeclaration = TSESTree.VariableDeclaration
type VariableDeclarator = TSESTree.VariableDeclarator
export type ProgramConstant = VariableDeclarator & {
  kind: VariableDeclaration['kind']
}
export type ProgramConstants = ProgramConstant[]

const CONSTANT_MODIFIERS = [
  AST_NODE_TYPES.Program,
  AST_NODE_TYPES.ExportNamedDeclaration,
]

function isTopLevelConstant(
  this: AstTraverser,
  node: Node,
  kinds: readonly VariableKind[]
): boolean {
  if (guardVariableDeclarationOfKind(node, kinds)) {
    return true
  }

  if (!CONSTANT_MODIFIERS.includes(node.type)) {
    this.skip() // doesn't traverse this node any further
  }

  return false
}

/**
 * Finds all constants declared at the top-level of the scope of the node given.
 *
 * @param root the top-level
 * @returns Node[]
 */
export function findTopLevelConstants(
  root: Node,
  kinds: readonly VariableKind[]
): ProgramConstants {
  const constants = findAll(
    root,
    function (this: AstTraverser, node): node is VariableDeclaration {
      if (isTopLevelConstant.call(this, node, kinds)) {
        this.skip()
        return true
      }

      return false
    }
  )!

  return constants.reduce<ProgramConstants>(
    (declarations, declaration): ProgramConstants =>
      declarations.concat(
        declaration.declarations.map(
          (d): ProgramConstant => ({ ...d, kind: declaration.kind })
        )
      ),
    []
  )
}
