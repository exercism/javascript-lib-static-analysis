import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { traverse } from '../AstTraverser'

type Node = TSESTree.Node

/**
 * Find all nodes, traversing from root, that match the given predicate
 *
 * @example Find all literals
 *
 * findAll(program, (node) => node.type === AST_NODE_TYPES.Literal)
 *
 * @example Find all top-level constants
 *
 * findAll(program, (node) => {
 *   if (node.type !== AST_NODE_TYPES.VariableDeclaration || node.kind !== 'const') {
 *     this.skip() // doesn't traverse this node any further
 *     return false
 *   }
 *
 *   return true
 * }
 *
 * @param root the root to start traversing from
 * @param predicate predicate function that gets the traverse as bound this
 * @returns the nodes that return true for the predicate
 */
export function findAll<T extends Node>(
  root: Node,
  predicate: (node: Node) => node is T
): T[] {
  const results: T[] = []

  traverse(root, {
    enter(node): void {
      if (predicate.call(this, node)) {
        results.push(node as T)
      }
    },
  })

  return results
}
