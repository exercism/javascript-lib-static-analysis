import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree'
import { traverse } from '../AstTraverser'
import {
  isCallExpression,
  SpecificFunctionCall,
} from '../guards/is_call_expression'
import { isMemberExpression } from '../guards/is_member_expression'
import { isLiteral } from '../guards/is_literal'
import { isIdentifier } from '../guards/is_identifier'
import { findFirst } from '../queries/find_first'
import { extractSource } from './extract_source'

type Node = TSESTree.Node
type CallExpression = TSESTree.CallExpression

function isDescribe(node: Node): node is CallExpression {
  if (!isCallExpression(node)) {
    return false
  }

  const { callee } = node

  // describe('...')
  // xdescribe('...')
  if (isIdentifier(callee)) {
    return ['describe', 'xdescribe'].some(
      (identifier) => callee.name === identifier
    )
  }

  // describe.skip('...')
  // describe.only('...')
  //
  // xdescribe.skip('...')
  // xdescribe.only('...')
  return (
    isMemberExpression(node.callee, 'describe', 'skip') ||
    isMemberExpression(node.callee, 'describe', 'only') ||
    isMemberExpression(node.callee, 'xdescribe', 'skip') ||
    isMemberExpression(node.callee, 'xdescribe', 'only')
  )
}

function isTest(node: Node): node is CallExpression {
  if (!isCallExpression(node)) {
    return false
  }

  const { callee } = node

  // test('...')
  // xtest('...')
  //
  // it('...')
  // xit('...')
  if (isIdentifier(callee)) {
    return ['test', 'xtest', 'it', 'xit'].some(
      (identifier) => callee.name === identifier
    )
  }

  if (!isMemberExpression(callee)) {
    return false
  }

  const { object, property } = callee

  // test.skip('...')
  // test.only('...')
  // xtest.skip('...')
  // xtest.only('...')
  //
  // it.skip('...')
  // it.only('...')
  // xit.skip('...')
  // xit.only('...')
  if (isIdentifier(object) && isIdentifier(property)) {
    return (
      ['test', 'xtest', 'it', 'xit'].some((o) => object.name === o) &&
      ['skip', 'only'].some((p) => property.name === p)
    )
  }

  return false
}

export class TestCase {
  constructor(
    public readonly testNode:
      | TSESTree.FunctionExpression
      | TSESTree.ArrowFunctionExpression,
    public readonly description: string[],
    public readonly test: string,
    public readonly expectations: Expectation[]
  ) {
    //
  }

  public name(glue: ' > '): string {
    return [...this.description, this.test].join(glue)
  }

  public testCode(source: string): string {
    if (this.testNode.body.type === AST_NODE_TYPES.BlockStatement) {
      return this.testNode.body.body
        .map((statement) => extractSource(source, statement))
        .join('\n')
    }

    return extractSource(source, this.testNode.body)
  }
}

export class Expectation {
  constructor(
    public readonly statement: TSESTree.ExpressionStatement,
    public readonly expect: TSESTree.Node,
    public readonly actual: TSESTree.Node
  ) {}

  /**
   * Returns the source code of the entire expectation statement
   * @param source
   */
  public statementCode(source: string): string {
    return extractSource(source, this.statement)
  }

  /**
   * Given an expression such as expect(actual).toBe(true), returns everything
   * except the expect(actual), namely .toBe(true).
   *
   * @param source
   */
  public expectCode(source: string): string {
    return this.statementCode(source).substring(
      extractSource(source, this.expect).length
    )
  }

  /**
   * Given an expression such as expect(actual).toBe(true), returns only the
   * code inside expect(...), namely actual.
   *
   * @param source
   */
  public actualCode(source: string): string {
    return extractSource(source, this.actual)
  }
}

function extractExpectations(testNode: Node): Expectation[] {
  const results: Expectation[] = []
  const statements: TSESTree.ExpressionStatement[] = []

  traverse(testNode, {
    enter(node): void {
      if (node.type === AST_NODE_TYPES.ExpressionStatement) {
        statements.push(node)
        this.skip()
      }
    },
  })

  statements.forEach((statement) => {
    const expectation = findFirst(
      statement,
      (node): node is SpecificFunctionCall<'expect'> =>
        isCallExpression(node, 'expect')
    )

    if (expectation) {
      results.push(
        new Expectation(statement, expectation, expectation.arguments[0])
      )
    }
  })

  return results
}

export function extractTests(root: Node): TestCase[] {
  const results: TestCase[] = []
  const currentDescription: string[] = []

  traverse(root, {
    enter(node): void {
      if (node.type === AST_NODE_TYPES.ExpressionStatement) {
        const { expression } = node

        // Track groupings
        //
        // describe('...')
        // describe.skip('...')
        // describe.only('...')
        //
        // xdescribe('...')
        // xdescribe.skip('...')
        // xdescribe.only('...')
        //
        if (isDescribe(expression)) {
          const testNameArgument = expression.arguments[0]

          if (
            isLiteral(testNameArgument) &&
            typeof testNameArgument.value === 'string'
          ) {
            currentDescription.push(testNameArgument.value)
          } else {
            // Currently unsupported (such as template literal)
            this.skip()
          }
        }

        // Test case
        //
        // test('...')
        // test.skip('...')
        // test.only('...')
        //
        // xtest('...')
        // xtest.skip('...')
        // xtest.only('...')
        //
        // it('...')
        // it.skip('...')
        // it.only('...')
        //
        // xit('...')
        // xit.skip('...')
        // xit.only('...')
        if (isTest(expression)) {
          const [nameArgument, testArgument] = expression.arguments

          if (
            isLiteral(nameArgument) &&
            typeof nameArgument.value === 'string' &&
            (testArgument.type === AST_NODE_TYPES.FunctionExpression ||
              testArgument.type === AST_NODE_TYPES.ArrowFunctionExpression)
          ) {
            const testName = nameArgument.value

            results.push(
              new TestCase(
                testArgument,
                [...currentDescription],
                testName,
                extractExpectations(testArgument)
              )
            )
          } else {
            // Currently unsupported (such as template literal)
          }

          // Test cases are manually traversed
          this.skip()
        }
      }
    },

    exit(node): void {
      if (node.type === AST_NODE_TYPES.ExpressionStatement) {
        const { expression } = node
        if (isDescribe(expression)) {
          currentDescription.pop()
        }
      }
    },
  })

  return results
}
