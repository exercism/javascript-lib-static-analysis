import { TSESTree } from '@typescript-eslint/typescript-estree'
import { AstTraverser, traverse } from '../AstTraverser'

type Node = TSESTree.Node

/**
 * Find the first note (starting at root) that matches the given predicate.
 *
 * @example find the first literal
 *
 * findFirst(program, isLiteral)
 *
 * @example find the first multiplication
 *
 * findFirst(program, (node) => isBinaryExpression(node, '*'))
 *
 * @param root the root to start traversing from
 * @param predicate predicate function that gets the traverse as bound this
 * @returns the node that returns true for the predicate or undefined
 */
export function findFirst<T extends Node>(
  root: Node,
  predicate: (this: AstTraverser, node: Node) => node is T
): T | undefined {
  let result: T | undefined = undefined

  traverse(root, {
    enter(node: Node): void {
      if (predicate.call(this, node)) {
        result = node as T
        this.break()
      }
    },
  })

  return result
}
