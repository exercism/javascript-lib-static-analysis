import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { Identifier, guardIdentifier } from './is_identifier'
import { Literal, guardLiteral } from './is_literal'

type Node = TSESTree.Node
export type MemberExpression = TSESTree.MemberExpression

export type SpecificObject<O> = MemberExpression & {
  object: Identifier & { name: O }
}
export type SpecificProperty<P> = MemberExpression & {
  property: (Identifier & { name: P }) | (Literal & { value: P })
}
export type SpecificObjectProperty<O, P> = SpecificObject<O> &
  SpecificProperty<P>

export function guardMemberExpression<
  O extends string,
  P extends string | number
>(node: Node, object: O, property: P): node is SpecificObjectProperty<O, P>
export function guardMemberExpression<O extends string>(
  node: Node,
  object: O
): node is SpecificObject<O>
export function guardMemberExpression<P extends string>(
  node: Node,
  object: undefined,
  property: P
): node is SpecificProperty<P>
export function guardMemberExpression(node: Node): node is MemberExpression

export function guardMemberExpression<
  O extends string,
  P extends string | number
>(node: Node, object?: O, property?: P): node is MemberExpression {
  return (
    node.type === AST_NODE_TYPES.MemberExpression &&
    (typeof object === 'undefined' ||
      guardIdentifier<O>(node.object, object)) &&
    (typeof property === 'undefined' ||
      guardIdentifier<string>(node.property, property as string) ||
      guardLiteral(node.property, property))
  )
}

/**
 * @deprecated use guardMemberExpression because this clashes with a
 *   typescript internal name (which makes it harder to import this)
 */
export const isMemberExpression = guardMemberExpression
