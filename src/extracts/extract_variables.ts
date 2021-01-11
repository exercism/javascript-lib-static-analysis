import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { findAll } from '../queries/find_all'
import { guardIdentifier } from '../guards/is_identifier'

type Node = TSESTree.Node
type BindingName = TSESTree.BindingName
type Expression = TSESTree.Expression
type VariableDeclaration = TSESTree.VariableDeclaration

export class ExtractedVariable {
  public readonly name: string | null

  constructor(
    public readonly node: Node,
    public readonly binding: BindingName,
    public readonly kind: VariableDeclaration['kind'],
    public readonly init: Expression | null
  ) {
    this.name = guardIdentifier(binding) ? binding.name : null
  }

  public get initialized(): boolean {
    return this.init !== null
  }
}

export function extractVariables(root: Node): ExtractedVariable[] {
  const declarations = findAll(
    root,
    (node): node is VariableDeclaration =>
      node.type === AST_NODE_TYPES.VariableDeclaration
  )

  return declarations.flatMap((node) => {
    const { declarations, kind } = node

    return declarations.flatMap((declarator) => {
      switch (declarator.id.type) {
        // const identifier = ...
        // const identifier, identifier = ...
        case AST_NODE_TYPES.Identifier: {
          return [
            new ExtractedVariable(node, declarator.id, kind, declarator.init),
          ]
        }

        // const [identifier, identifier2] = ...
        case AST_NODE_TYPES.ArrayPattern: {
          return declarator.id.elements
            .map((element) => {
              if (element === null || !guardIdentifier(element)) {
                return null
              }

              return new ExtractedVariable(node, element, kind, declarator.init)
            })
            .filter(Boolean) as ExtractedVariable[]
        }

        //
        default: {
          return []
        }
      }
    })
  })
}
