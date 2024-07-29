import {
  AST_NODE_TYPES,
  type TSESTree,
} from '@typescript-eslint/typescript-estree'
import {
  guardMemberExpression,
  SpecificObject,
  SpecificProperty,
} from './is_member_expression'
import { guardIdentifier, Identifier } from './is_identifier'

type Node = TSESTree.Node
export type CallExpression = TSESTree.CallExpression

export type SpecificFunctionCall<C> = CallExpression & {
  callee: Identifier & { name: C }
}
export type SpecificObjectCall<O> = CallExpression & {
  callee: SpecificObject<O>
}
export type SpecificPropertyCall<P> = CallExpression & {
  callee: SpecificProperty<P>
}
export type SpecificObjectPropertyCall<O, P> = SpecificObjectCall<O> &
  SpecificPropertyCall<P>

export function guardCallExpression<_O extends string, C extends string>(
  node: Node,
  callee: C
): node is SpecificFunctionCall<C>
export function guardCallExpression<O extends string, P extends string>(
  node: Node,
  object: O,
  property: P
): node is SpecificObjectPropertyCall<O, P>
export function guardCallExpression<O extends string>(
  node: Node,
  object: O
): node is SpecificObjectCall<O>
export function guardCallExpression<P extends string>(
  node: Node,
  object: undefined,
  property: P
): node is SpecificPropertyCall<P>
export function guardCallExpression<_P extends string>(
  node: Node
): node is CallExpression

export function guardCallExpression<
  O extends string | undefined,
  P extends string | undefined,
  C extends string | undefined,
>(node: Node, object?: O | C, property?: P): node is CallExpression {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return false
  }

  if (typeof object === 'string' && !property) {
    if (guardIdentifier(node.callee, object)) {
      return true
    }
  }

  if (!object && !property) {
    return true
  }

  return guardMemberExpression<string, string>(node.callee, object!, property!)
}

/**
 * @deprecated use guardCallExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isCallExpression = guardCallExpression
