import {
  AST_NODE_TYPES,
  type TSESTree,
} from '@typescript-eslint/typescript-estree'
import { traverse } from '../AstTraverser'
import { guardIdentifier } from '../guards/is_identifier'
import { guardLiteral } from '../guards/is_literal'
import { guardMemberExpression } from '../guards/is_member_expression'

export const ANONYMOUS = '__anonymous'

type Node = TSESTree.Node
export type ExportNode =
  | TSESTree.ExportAllDeclaration
  | TSESTree.ExportNamedDeclaration
  | TSESTree.ExportDefaultDeclaration
  | (TSESTree.ExpressionStatement & {
      expression: TSESTree.AssignmentExpression
    })
export type ExportNamedDeclaration = TSESTree.ExportNamedDeclaration

export class ExtractedExport {
  public readonly name: string | null

  constructor(
    public readonly node: ExportNode,
    public readonly local: string,
    public readonly exported: string,
    public readonly exportKind:
      | ExportNamedDeclaration['exportKind']
      | 'unknown',
    public readonly kind:
      | 'class'
      | 'variable'
      | 'interface'
      | 'type'
      | 'function'
      | 'identifier'
      | 'unknown'
  ) {
    this.name = local
  }
}

/**
 *
 * @param root
 * @see https://astexplorer.net/#/gist/2aa27ed655187c1db5badd04522e7784/4789aa42e4b53af9f7cfb39e448a5d64fbc2e9b5
 */
export function extractExports(root: Node): ExtractedExport[] {
  const exports: ExtractedExport[] = []

  traverse(root, {
    enter(node): void {
      // Exports in ES6 may only be declared at the top-level. If a node is
      // traversed that's not the top-level program, its children should be
      // skipped.
      //
      // module.exports inside a function (except for a top-level IIFE) is a big
      // code smell, and never required on Exercism, so not supported.
      // https://developer.mozilla.org/en-US/docs/Glossary/IIFE
      if (node.type !== AST_NODE_TYPES.Program) {
        this.skip()
      }

      switch (node.type) {
        // export { name }
        // export { name as otherName }
        // export { name } from 'foo'
        //
        // export class Name {}
        // export function name() {}
        //
        // export const name
        // export let name
        // export var name
        //
        // export interface Interface {}
        // export type Type = {}
        case AST_NODE_TYPES.ExportNamedDeclaration: {
          const { declaration, specifiers } = node

          if (!declaration) {
            // export { name }
            // export { name as otherName }
            // export { name } from 'foo'
            if (specifiers && specifiers.length > 0) {
              //
              specifiers.forEach((specifier) => {
                const localName =
                  node.source && guardLiteral(node.source)
                    ? `${node.source.value}.${specifier.local.name}`
                    : specifier.local.name

                const exportedName = specifier.exported.name

                exports.push(
                  new ExtractedExport(
                    node,
                    localName,
                    exportedName,
                    'unknown',
                    'unknown'
                  )
                )
              })
            }
            break
          }

          switch (declaration.type) {
            // export class Name {}
            case AST_NODE_TYPES.ClassDeclaration: {
              if (declaration.id) {
                exports.push(
                  new ExtractedExport(
                    node,
                    declaration.id.name,
                    declaration.id.name,
                    'value',
                    'class'
                  )
                )
              }
              break
            }

            // export function name() {}
            case AST_NODE_TYPES.FunctionDeclaration: {
              if (declaration.id) {
                exports.push(
                  new ExtractedExport(
                    node,
                    declaration.id.name,
                    declaration.id.name,
                    'value',
                    'function'
                  )
                )
              }
              break
            }

            // export const name
            // export let name
            // export var name
            //
            // export const name, foo
            // export let name, foo
            // export var name, foo
            case AST_NODE_TYPES.VariableDeclaration: {
              const { declarations } = declaration
              declarations.forEach((declarator) => {
                // Other patterns such as export const [a, b] are not supported.
                if (guardIdentifier(declarator.id)) {
                  exports.push(
                    new ExtractedExport(
                      node,
                      declarator.id.name,
                      declarator.id.name,
                      'value',
                      declarator.init &&
                      [
                        AST_NODE_TYPES.ArrowFunctionExpression,
                        AST_NODE_TYPES.FunctionExpression,
                      ].includes(declarator.init.type)
                        ? 'function'
                        : 'variable'
                    )
                  )
                }
              })
              break
            }

            // export interface Interface {}
            // export declare interface Interface {}
            case AST_NODE_TYPES.TSInterfaceDeclaration: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.id.name,
                  declaration.id.name,
                  'type',
                  'interface'
                )
              )
              break
            }

            // export type Type = {}
            // export declare Type = {}
            case AST_NODE_TYPES.TSTypeAliasDeclaration: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.id.name,
                  declaration.id.name,
                  'type',
                  'type'
                )
              )
              break
            }
          }
          break
        }

        // export * from 'bar'
        // export * as name from 'bar'
        case AST_NODE_TYPES.ExportAllDeclaration: {
          const exported = node.exported ? node.exported.name : '*'
          exports.push(
            new ExtractedExport(node, '*', exported, 'unknown', 'unknown')
          )
          break
        }

        // export default name
        // export default { name }
        // export default [ name ]
        // export default class Name {}
        // export default class {}
        // export default function Name() {}
        // export default function () {}
        // export default () => {}
        // export default interface Name {}
        case AST_NODE_TYPES.ExportDefaultDeclaration: {
          const { declaration } = node
          switch (declaration.type) {
            // export default name
            case AST_NODE_TYPES.Identifier: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.name,
                  'default',
                  'unknown',
                  'identifier'
                )
              )
              break
            }

            // export default { name }
            case AST_NODE_TYPES.ObjectExpression: {
              // This is currently unsupported
              break
            }

            // export default [ name ]
            case AST_NODE_TYPES.ArrayExpression: {
              // This is currently unsupported
              break
            }

            // export default class Name {}
            // export default class {}
            case AST_NODE_TYPES.ClassDeclaration: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.id?.name || ANONYMOUS,
                  'default',
                  'value',
                  'class'
                )
              )
              break
            }

            // export default function Name() {}
            // export default function {}
            case AST_NODE_TYPES.FunctionDeclaration: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.id?.name || ANONYMOUS,
                  'default',
                  'value',
                  'function'
                )
              )
              break
            }

            // export default () => {}
            case AST_NODE_TYPES.ArrowFunctionExpression: {
              exports.push(
                new ExtractedExport(
                  node,
                  ANONYMOUS,
                  'default',
                  'value',
                  'function'
                )
              )
              break
            }

            // export default interface Name {}
            case AST_NODE_TYPES.TSInterfaceDeclaration: {
              exports.push(
                new ExtractedExport(
                  node,
                  declaration.id.name,
                  'default',
                  'type',
                  'interface'
                )
              )
              break
            }
          }

          break
        }

        // https://blog.tableflip.io/the-difference-between-module-exports-and-exports/
        //
        // module.exports = { name }
        // module.exports = { bar: name }
        // module.exports.name = ...
        // module.exports.bar = name
        //
        // exports.name = ...
        // exports.bar = name
        //
        // TODO: exports = module.exports = ...
        // TODO: exports = module.exports = { name }
        // TODO: exports = module.exports = { bar: name }
        case AST_NODE_TYPES.ExpressionStatement: {
          const { expression } = node

          switch (expression.type) {
            case AST_NODE_TYPES.AssignmentExpression: {
              // module.exports = { ... }
              if (
                guardMemberExpression(expression.left, 'module', 'exports') &&
                expression.operator === '=' &&
                expression.right.type === AST_NODE_TYPES.ObjectExpression
              ) {
                expression.right.properties.forEach((property) => {
                  if (property.type !== AST_NODE_TYPES.Property) {
                    // Non-property expressions are not supported
                    return
                  }

                  if (
                    !guardIdentifier(property.key) ||
                    !guardIdentifier(property.value)
                  ) {
                    // Nested expression are not supported
                    return
                  }

                  exports.push(
                    new ExtractedExport(
                      { ...node, expression },
                      property.value.name,
                      property.key.name,
                      'value',
                      'unknown'
                    )
                  )
                })
              }

              // module.exports.name = ...
              if (
                guardMemberExpression(expression.left) &&
                guardMemberExpression(
                  expression.left.object,
                  'module',
                  'exports'
                ) &&
                guardIdentifier(expression.left.property)
              ) {
                exports.push(
                  new ExtractedExport(
                    { ...node, expression },
                    guardIdentifier(expression.right)
                      ? expression.right.name
                      : ANONYMOUS,
                    expression.left.property.name,
                    'value',
                    'unknown'
                  )
                )
              }

              // exports.name = ...
              // exports.bar = name
              if (
                guardMemberExpression(expression.left, 'exports') &&
                guardIdentifier(expression.left.property)
              ) {
                const exportedName = expression.left.property.name

                // Exporting a binding, such as a previously declared variable
                // or function
                const localName = guardIdentifier(expression.right)
                  ? expression.right.name
                  : // Exporting an inline declared function
                    expression.right.type ===
                        AST_NODE_TYPES.FunctionExpression &&
                      guardIdentifier(expression.right.id)
                    ? expression.right.id.name
                    : exportedName

                exports.push(
                  new ExtractedExport(
                    { ...node, expression },
                    localName,
                    exportedName,
                    'value',
                    guardIdentifier(expression.right)
                      ? 'identifier'
                      : expression.right.type ===
                          AST_NODE_TYPES.FunctionExpression
                        ? 'function'
                        : 'unknown'
                  )
                )
              }
              break
            }
          }
          break
        }
      }
    },
  })

  return exports
}
