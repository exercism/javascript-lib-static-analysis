import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import {
  isMemberExpression,
  SpecificObject,
  SpecificProperty,
} from './is_member_expression'
import { isIdentifier } from './is_identifier'

type Node = TSESTree.Node
type CallExpression = TSESTree.CallExpression
type Identifier = TSESTree.Identifier

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

export function isCallExpression<O extends string, C extends string>(
  node: Node,
  callee: C
): node is SpecificFunctionCall<C>
export function isCallExpression<O extends string, P extends string>(
  node: Node,
  object: O,
  property: P
): node is SpecificObjectPropertyCall<O, P>
export function isCallExpression<O extends string>(
  node: Node,
  object: O
): node is SpecificObjectCall<O>
export function isCallExpression<P extends string>(
  node: Node,
  object: undefined,
  property: P
): node is SpecificPropertyCall<P>
export function isCallExpression<P extends string>(
  node: Node
): node is CallExpression

export function isCallExpression<
  O extends string | undefined,
  P extends string | undefined,
  C extends string | undefined
>(node: Node, object?: O | C, property?: P): node is CallExpression {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return false
  }

  if (typeof object === 'string' && !property) {
    if (isIdentifier(node.callee, object)) {
      return true
    }
  }

  if (!object && !property) {
    return true
  }

  return isMemberExpression<string, string>(node.callee, object!, property!)
}
