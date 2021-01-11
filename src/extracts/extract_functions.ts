import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { FunctionExpression } from 'typescript'
import { traverse } from '../AstTraverser'
import { guardIdentifier } from '../guards'
import { ExtractedVariable } from './extract_variables'

type Node = TSESTree.Node
type MethodDefinition = TSESTree.MethodDefinition

export type ExtractedFunctionMetadata = {
  isAsync: boolean
  isGenerator: boolean
  isExpression: boolean
  isStatic?: boolean
  accessibility?: MethodDefinition['accessibility']

  params: readonly TSESTree.Parameter[]
  variable?: ExtractedVariable
  klazz?: string
}

function extractedKindFromDefinition(
  kind: MethodDefinition['kind']
): ExtractedFunction['type'] {
  switch (kind) {
    case 'get': {
      return 'getter'
    }

    case 'set': {
      return 'setter'
    }

    default: {
      return kind
    }
  }
}

export class ExtractedFunction {
  constructor(
    public readonly node: Node,
    public readonly name: string | undefined,
    public readonly type:
      | 'declaration' // function declaration()
      | 'expression' // ... = function () { }
      | 'property' // { property() {} }
      | 'getter' // class { get property() {} }
      | 'setter' // class { set property(v) {} }
      | 'constructor' // class { constructor() {} }
      | 'method' // class { property() {} }
      | 'class-property' // class { property = () => {} }
      | 'prototype-assignment', // Klazz.prototype.property = () => {}
    public readonly metadata: ExtractedFunctionMetadata
  ) {
    //
  }
}

// https://astexplorer.net/#/gist/aeb176dec81ee8449b98c3e648adb8aa/a4f2a2133cb46de056eed44dac876a594d6a8940
//
// function declaration() { return 42 }
// function* declaration() { yield 42 }
// async function declaration() { }
// async function* declaration() { }
//
// const named = function () { return 42 }
// const named = function* () { return 42 }
// const named = async function() { }
// const named = async function*() { }
//
// let named = ...
// var name = ...
//
// const arrow = () => { return 42 }
// const arrow = () => 42
// const arrow = async () => { }
// const arrow = async () => 42
//
// collection.assignment = () => {}
// collection.assignment = async () => {}
//
// Object.defineProperty(collection, 'property', { value: () => { return 42 } })
//
// const computed = 'name'
// const collection = {
//   shorthand() { return 42 },
//   *shorthand() { yield 42 },
//   async shorthand() { },
//   async *shorthand() { }
//
//   [computed]() { return 42 }
//   *[computed]() { yield 42 }
//   async [computed]() { }
//   async *[computed]() { }
//
//   property: () => { return 42 },
//   property: async () => {},
//   property: function () { return 42 },
//   property: function* () { yield 42 },
//   property: async function () {},
//   property: async function* () {},
//
//   [computed]: () => { return 42 },
//   [computed]: async () => {},
//   [computed]: function () { return 42 },
//   [computed]: function* () { yield 42 },
//   [computed]: async function () {},
//   [computed]: async function* () {}
// }
//
// class Klazz {
//   get property() { return 42 }
//   set property(value) { }
//
//   property = () => { return 42 }
//   property = async () => {}
//   property = function () { return 42 }
//   property = function* () { yield 42 }
//   property = async function () { }
//   property = async function* () { }
//
//   [computed] = () => { return 42 },
//   [computed] = async () => {},
//   [computed] = function () { return 42 },
//   [computed] = function* () { yield 42 },
//   [computed] = async function () {},
//   [computed] = async function* () {}
//
//   shorthand() { return 42 }
//  *shorthand() { return 42 }
//   async shorthand() { }
//   async *shorthand() { }
//
//   [computed]() { return 42 }
//  *[computed]() { yield 42 }
//   async [computed]() { }
//   async *[computed]() { }
//
//   static property = () => { return 42 }
//   static property = async () => {}
//   static property = function () { return 42 }
//   static property = function* () { yield 42 }
//   static property = async function () { }
//   static property = async function* () { }
//
//   static [computed] = () => { return 42 }
//   static [computed] = async () => {}
//   static [computed] = function () { return 42 }
//   static [computed] = function* () { yield 42 }
//   static [computed] = async function () { }
//   static [computed] = async function* () { }
//
//   static shorthand() { return 42 }
//   static *shorthand() { yield 42 }
//   static async shorthand() {}
//   static async *shorthand() {}
//
//   static [computed]() { return 42 }
//   static *[computed]() { yield 42 }
//   static async [computed]() { }
//   static async *[computed]() { }
//
//   #property = () => { }
//   #shorthand() { }
// }
//
// Klazz.prototype.fn = () => { }
// Klazz.prototype.fn = async () => { }
// Klazz.prototype.fn = function () { }
// Klazz.prototype.fn = function* () { }
// Klazz.prototype.fn = async function () { }
// Klazz.prototype.fn = async function* () { }
//
// export default { name: () => {} }
// export default { name: async () => {} }
// export default { name: function () {} }
// export default { name: function* () {} }
// export default { name: async function () {} }
// export default { name: async function* () {} }
//
// export default { [computed]: () => {} }
// export default { [computed]: async () => {} }
// export default { [computed]: function () {} }
// export default { [computed]: function* () {} }
// export default { [computed]: async function () {} }
// export default { [computed]: async function* () {} }
//
// export default { name() {} }
// export default { *name() {} }
// export default { async name() {} }
// export default { async *name() {} }
//
// export default { [computed]() {} }
// export default { *[computed]() {} }
// export default { async [computed]() {} }
// export default { async *[computed]() {} }
export function extractFunctions(root: Node): ExtractedFunction[] {
  const results: ExtractedFunction[] = []

  traverse(root, {
    // function declaration() { return 42 }
    // function* declaration() { yield 42 }
    // async function declaration() { }
    // async function* declaration() { }
    [AST_NODE_TYPES.FunctionDeclaration]: function (node) {
      this.skip()

      const {
        async: isAsync,
        generator: isGenerator,
        expression: isExpression,
        params,
      } = node
      const metadata = { isAsync, isGenerator, isExpression, params }

      results.push(
        new ExtractedFunction(node, node.id?.name, 'declaration', metadata)
      )
    },

    // const named = function () { return 42 }
    // const named = function* () { return 42 }
    // const named = async function() { }
    // const named = async function*() { }
    //
    // let named = ...
    // var name = ...
    //
    // const arrow = () => { return 42 }
    // const arrow = () => 42
    // const arrow = async () => { }
    // const arrow = async () => 42
    [AST_NODE_TYPES.VariableDeclaration]: function (node) {
      node.declarations.forEach((declarator) => {
        // Skip uninitialized variables. This means that late-initialized
        // variables are not supported at the moment, but later they could be
        // added by adding them in this code-path.
        if (!declarator.init) {
          return
        }

        // Unlike declarations, the name is rebound to the variable and thus
        // it's not necessarily the same as the function's declared name. In
        // other words, from an analysis perspective, only the identifier that
        // will be used to CALL this function matters.
        const name = guardIdentifier(declarator.id)
          ? declarator.id.name
          : undefined

        // The variable this is bound to can be extracted as metadata
        const variable = new ExtractedVariable(
          node,
          declarator.id,
          node.kind,
          declarator.init
        )

        switch (declarator.init.type) {
          // () => { return 42 }
          // () => 42
          // async () => { }
          // async () => 42
          case AST_NODE_TYPES.ArrowFunctionExpression: {
            this.skip()

            const {
              async: isAsync,
              generator: isGenerator,
              expression: isExpression,
              params,
            } = declarator.init
            const metadata = {
              isAsync,
              isGenerator,
              isExpression,
              params,
              variable,
            }

            results.push(
              new ExtractedFunction(declarator, name, 'expression', metadata)
            )
            return
          }

          // function () { return 42 }
          // function* () { return 42 }
          // async function() { }
          // async function*() { }
          case AST_NODE_TYPES.FunctionExpression: {
            this.skip()

            const {
              async: isAsync,
              generator: isGenerator,
              expression: isExpression,
              params,
            } = declarator.init
            const metadata = {
              isAsync,
              isGenerator,
              isExpression,
              params,
              variable,
            }

            results.push(
              new ExtractedFunction(declarator, name, 'expression', metadata)
            )
            return
          }
        }
      })
    },

    // class ...
    [AST_NODE_TYPES.ClassDeclaration]: function (node) {
      this.skip()

      const klazz = node.id?.name

      node.body.body.forEach((node) => {
        switch (node.type) {
          // constructor() { }
          // get property() { return 42 }
          // set property(value) { }
          //
          // shorthand() { return 42 }
          // *shorthand() { return 42 }
          // async shorthand() { }
          // async *shorthand() { }
          //
          // [computed]() { return 42 }
          // *[computed]() { yield 42 }
          // async [computed]() { }
          // async *[computed]() { }
          //
          // static shorthand() { return 42 }
          // static *shorthand() { yield 42 }
          // static async shorthand() {}
          // static async *shorthand() {}
          //
          // static [computed]() { return 42 }
          // static *[computed]() { yield 42 }
          // static async [computed]() { }
          // static async *[computed]() { }
          //
          // #shorthand() { }
          case AST_NODE_TYPES.MethodDefinition: {
            if (node.value.type !== AST_NODE_TYPES.FunctionExpression) {
              return
            }

            const kind = extractedKindFromDefinition(node.kind)
            const name =
              !node.computed && guardIdentifier(node.key)
                ? node.key.name
                : undefined
            const {
              async: isAsync,
              generator: isGenerator,
              expression: isExpression,
              params,
            } = node.value
            const metadata = {
              isAsync,
              isGenerator,
              isExpression,
              isStatic: node.static,
              accessibility: node.accessibility,
              params,
              klazz,
            }

            results.push(new ExtractedFunction(node, name, kind, metadata))
            return
          }

          // property = () => { return 42 }
          // property = async () => {}
          // property = function () { return 42 }
          // property = function* () { yield 42 }
          // property = async function () { }
          // property = async function* () { }
          //
          // [computed] = () => { return 42 }
          // [computed] = async () => {}
          // [computed] = function () { return 42 }
          // [computed] = function* () { yield 42 }
          // [computed] = async function () { }
          // [computed] = async function* () { }
          //
          // static property = () => { return 42 }
          // static property = async () => {}
          // static property = function () { return 42 }
          // static property = function* () { yield 42 }
          // static property = async function () { }
          // static property = async function* () { }
          //
          // static [computed] = () => { return 42 }
          // static [computed] = async () => {}
          // static [computed] = function () { return 42 }
          // static [computed] = function* () { yield 42 }
          // static [computed] = async function () { }
          // static [computed] = async function* () { }
          //
          // #property = () => { }
          case AST_NODE_TYPES.ClassProperty: {
            if (!node.value) {
              return
            }

            switch (node.value.type) {
              case AST_NODE_TYPES.ArrowFunctionExpression:
              case AST_NODE_TYPES.FunctionExpression: {
                const name =
                  !node.computed && guardIdentifier(node.key)
                    ? node.key.name
                    : undefined
                const {
                  async: isAsync,
                  generator: isGenerator,
                  expression: isExpression,
                  params,
                } = node.value
                const metadata = {
                  isAsync,
                  isGenerator,
                  isExpression,
                  isStatic: node.static,
                  accessibility: node.accessibility,
                  params,
                  klazz,
                }

                results.push(
                  new ExtractedFunction(node, name, 'class-property', metadata)
                )
                return
              }

              default: {
                return
              }
            }
          }

          default: {
            return
          }
        }
      })
    },

    // const name = 'computed'
    // const collection = {
    //   shorthand() { return 42 },
    //   *shorthand() { yield 42 },
    //   async shorthand() { },
    //   async *shorthand() { }
    //
    //   [computed]() { return 42 }
    //   *[computed]() { yield 42 }
    //   async [computed]() { }
    //   async *[computed]() { }
    //
    //   property: () => { return 42 },
    //   property: async () => {},
    //   property: function () { return 42 },
    //   property: function* () { yield 42 },
    //   property: async function () {},
    //   property: async function* () {},
    //
    //   [computed]: () => { return 42 },
    //   [computed]: async () => {},
    //   [computed]: function () { return 42 },
    //   [computed]: function* () { yield 42 },
    //   [computed]: async function () {},
    //   [computed]: async function* () {}
    // }
    //
    // export default { name: () => {} }
    // export default { name: async () => {} }
    // export default { name: function () {} }
    // export default { name: function* () {} }
    // export default { name: async function () {} }
    // export default { name: async function* () {} }
    //
    // export default { [computed]: () => {} }
    // export default { [computed]: async () => {} }
    // export default { [computed]: function () {} }
    // export default { [computed]: function* () {} }
    // export default { [computed]: async function () {} }
    // export default { [computed]: async function* () {} }
    //
    // export default { name() {} }
    // export default { *name() {} }
    // export default { async name() {} }
    // export default { async *name() {} }
    //
    // export default { [computed]() {} }
    // export default { *[computed]() {} }
    // export default { async [computed]() {} }
    // export default { async *[computed]() {} }
    [AST_NODE_TYPES.Property]: function (property) {
      switch (property.value.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionExpression: {
          this.skip()

          const name =
            !property.computed && guardIdentifier(property.key)
              ? property.key.name
              : undefined
          const {
            async: isAsync,
            generator: isGenerator,
            expression: isExpression,
            params,
          } = property.value
          const metadata = {
            isAsync,
            isGenerator,
            isExpression,
            params,
          }

          results.push(
            new ExtractedFunction(property, name, 'property', metadata)
          )
          return
        }
      }
    },

    [AST_NODE_TYPES.AssignmentExpression]: function (assignment) {
      // Search for x.y = ...
      if (
        assignment.operator !== '=' ||
        assignment.left.type !== AST_NODE_TYPES.MemberExpression
      ) {
        return
      }

      // Search for x.prototype.z
      if (
        assignment.left.object.type !== AST_NODE_TYPES.MemberExpression ||
        !guardIdentifier(assignment.left.property) ||
        !guardIdentifier(assignment.left.object.object) ||
        !guardIdentifier(assignment.left.object.property) ||
        assignment.left.object.property.name !== 'prototype'
      ) {
        return
      }

      const klazz = assignment.left.object.object.name
      const name = assignment.left.property.name

      // Klazz.prototype.fn = () => { }
      // Klazz.prototype.fn = async () => { }
      // Klazz.prototype.fn = function () { }
      // Klazz.prototype.fn = function* () { }
      // Klazz.prototype.fn = async function () { }
      // Klazz.prototype.fn = async function* () { }
      switch (assignment.right.type) {
        case AST_NODE_TYPES.FunctionExpression:
        case AST_NODE_TYPES.ArrowFunctionExpression: {
          this.skip()

          const {
            async: isAsync,
            generator: isGenerator,
            expression: isExpression,
            params,
          } = assignment.right
          const metadata = {
            isAsync,
            isGenerator,
            isExpression,
            params,
            klazz,
          }

          results.push(
            new ExtractedFunction(
              assignment,
              name,
              'prototype-assignment',
              metadata
            )
          )
          return
        }
      }
    },
  })

  /** (Still) unsupported as of this commit are:
   *
   * collection.assignment = () => {}
   * collection.assignment = async () => {}
   *
   * Object.defineProperty(collection, 'property', { value: () => { return 42 } })
   */

  return results
}
