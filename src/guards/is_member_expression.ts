import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { isIdentifier } from './is_identifier'
import { isLiteral } from './is_literal'

type Node = TSESTree.Node
type MemberExpression = TSESTree.MemberExpression
type Identifier = TSESTree.Identifier
type Literal = TSESTree.Literal

export type SpecificObject<O> = MemberExpression & {
  object: Identifier & { name: O }
}
export type SpecificProperty<P> = MemberExpression & {
  property: (Identifier & { name: P }) | (Literal & { value: P })
}
export type SpecificObjectProperty<O, P> = SpecificObject<O> &
  SpecificProperty<P>

export function isMemberExpression<O extends string, P extends string | number>(
  node: Node,
  object: O,
  property: P
): node is SpecificObjectProperty<O, P>
export function isMemberExpression<O extends string>(
  node: Node,
  object: O
): node is SpecificObject<O>
export function isMemberExpression<P extends string>(
  node: Node,
  object: undefined,
  property: P
): node is SpecificProperty<P>
export function isMemberExpression(node: Node): node is MemberExpression
export function isMemberExpression<O extends string, P extends string | number>(
  node: Node,
  object?: O,
  property?: P
): node is MemberExpression {
  return (
    node.type === AST_NODE_TYPES.MemberExpression &&
    (typeof object === 'undefined' || isIdentifier<O>(node.object, object)) &&
    (typeof property === 'undefined' ||
      isIdentifier<string>(node.property, property as string) ||
      isLiteral(node.property, property))
  )
}
