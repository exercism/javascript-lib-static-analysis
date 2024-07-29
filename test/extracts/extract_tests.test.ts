import { AstParser } from '~src/AstParser'
import { extractTests } from '~src/extracts/extract_tests'
import { InlineInput } from '~src/input/InlineInput'

import { describe, it, expect } from '@jest/globals'

describe('extractTests', () => {
  it('finds a top level test', async () => {
    const input = new InlineInput([
      `test("it finds this test", () => {
        expect(true).toBe(true)
        expect(false).not.toBe(true)
      })`,
    ])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const [foundTest, ...others] = extractTests(program)

    expect(foundTest).not.toBeUndefined()
    expect(foundTest.test).toBe('it finds this test')
    expect(foundTest.description).toHaveLength(0)
    expect(foundTest.expectations).toHaveLength(2)

    expect(others).toHaveLength(0)
  })

  it('can extract the test code', async () => {
    const input = new InlineInput([
      `test("it finds this test", () => {
        const actual = 3 * 3
        expect(actual).not.toBe(42)
      })`,
    ])
    const [{ program, source }] = await AstParser.ANALYZER.parse(input)

    const [foundTest, ...others] = extractTests(program)

    expect(foundTest).not.toBeUndefined()
    expect(foundTest.test).toBe('it finds this test')
    expect(foundTest.description).toHaveLength(0)
    expect(foundTest.expectations).toHaveLength(1)

    expect(others).toHaveLength(0)

    const [expectation] = foundTest.expectations

    const statementCode = expectation.statementCode(source)
    const expectCode = expectation.expectCode(source)
    const actualCode = expectation.actualCode(source)
    const testCode = foundTest.testCode(source)

    expect(statementCode).toBe('expect(actual).not.toBe(42)')
    expect(expectCode).toBe('.not.toBe(42)')
    expect(actualCode).toBe('actual')
    expect(testCode).toBe('const actual = 3 * 3\nexpect(actual).not.toBe(42)')
  })

  const methods = ['it', 'xit', 'test', 'xtest']
  const properties = ['skip', 'only']

  methods.forEach((method) => {
    it(`finds a top level test that uses "${method}"`, async () => {
      const input = new InlineInput([
        `${method}("it finds this ${method} test", () => {
        expect(true).toBe(true)
      })`,
      ])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [foundTest, ...others] = extractTests(program)

      expect(foundTest).not.toBeUndefined()
      expect(foundTest.test).toBe(`it finds this ${method} test`)
      expect(foundTest.description).toHaveLength(0)
      expect(foundTest.expectations).toHaveLength(1)

      expect(others).toHaveLength(0)
    })

    properties.forEach((property) => {
      it(`finds a top level test that uses "${method}.${property}"`, async () => {
        const input = new InlineInput([
          `${method}.${property}("it finds this ${method} test", () => {
            expect(true).toBe(true)
          })`,
        ])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundTest, ...others] = extractTests(program)

        expect(foundTest).not.toBeUndefined()
        expect(foundTest.test).toBe(`it finds this ${method} test`)
        expect(foundTest.description).toHaveLength(0)
        expect(foundTest.expectations).toHaveLength(1)

        expect(others).toHaveLength(0)
      })
    })
  })

  it('finds grouped tests', async () => {
    const input = new InlineInput([
      `describe("test group", () => {
        test("it finds this test", () => {
          expect(true).toBe(true)
        })

        test("it also finds this test", () => {
          expect(true).toBe(true)
        })
      })`,
    ])

    const [{ program }] = await AstParser.ANALYZER.parse(input)
    const [foundTest, foundAlsoTest, ...others] = extractTests(program)

    expect(foundTest).not.toBeUndefined()
    expect(foundTest.test).toBe('it finds this test')
    expect(foundTest.description).toStrictEqual(['test group'])
    expect(foundTest.expectations).toHaveLength(1)

    expect(foundAlsoTest).not.toBeUndefined()
    expect(foundAlsoTest.test).toBe('it also finds this test')
    expect(foundAlsoTest.description).toStrictEqual(['test group'])
    expect(foundAlsoTest.expectations).toHaveLength(1)

    expect(others).toHaveLength(0)
  })

  const groups = ['describe', 'xdescribe']
  groups.forEach((group) => {
    it(`finds grouped tests that uses "${group}"`, async () => {
      const input = new InlineInput([
        `${group}("test ${group} group", () => {
          test("it finds this test", () => {
            expect(true).toBe(true)
          })

          test("it also finds this test", () => {
            expect(true).toBe(true)
          })
        })`,
      ])

      const [{ program }] = await AstParser.ANALYZER.parse(input)
      const [foundTest, foundAlsoTest, ...others] = extractTests(program)

      expect(foundTest).not.toBeUndefined()
      expect(foundTest.test).toBe('it finds this test')
      expect(foundTest.description).toStrictEqual([`test ${group} group`])
      expect(foundTest.expectations).toHaveLength(1)

      expect(foundAlsoTest).not.toBeUndefined()
      expect(foundAlsoTest.test).toBe('it also finds this test')
      expect(foundAlsoTest.description).toStrictEqual([`test ${group} group`])
      expect(foundAlsoTest.expectations).toHaveLength(1)

      expect(others).toHaveLength(0)
    })

    properties.forEach((property) => {
      it(`finds grouped tests that uses "${group}.${property}"`, async () => {
        const input = new InlineInput([
          `${group}.${property}("test ${group} group", () => {
            test("it finds this test", () => {
              expect(true).toBe(true)
            })

            test("it also finds this test", () => {
              expect(true).toBe(true)
            })
          })`,
        ])

        const [{ program }] = await AstParser.ANALYZER.parse(input)
        const [foundTest, foundAlsoTest, ...others] = extractTests(program)

        expect(foundTest).not.toBeUndefined()
        expect(foundTest.test).toBe('it finds this test')
        expect(foundTest.description).toStrictEqual([`test ${group} group`])
        expect(foundTest.expectations).toHaveLength(1)

        expect(foundAlsoTest).not.toBeUndefined()
        expect(foundAlsoTest.test).toBe('it also finds this test')
        expect(foundAlsoTest.description).toStrictEqual([`test ${group} group`])
        expect(foundAlsoTest.expectations).toHaveLength(1)

        expect(others).toHaveLength(0)
      })
    })
  })

  it('finds deeply nested tests', async () => {
    const input = new InlineInput([
      `describe("test group", () => {
        test("it finds this test", () => {
          expect(true).toBe(true)
        })

        describe("nested group", () => {
          describe("deeply nested group", () => {
            test("it also finds this test", () => {
              expect(true).toBe(true)
            })
          })

          test("it finds this last test", () => {
            expect(true).toBe(true)
          })
        })
      })`,
    ])

    const [{ program }] = await AstParser.ANALYZER.parse(input)
    const [foundTest, foundAlsoTest, foundLastTest, ...others] =
      extractTests(program)

    expect(foundTest).not.toBeUndefined()
    expect(foundTest.test).toBe('it finds this test')
    expect(foundTest.description).toStrictEqual(['test group'])
    expect(foundTest.expectations).toHaveLength(1)

    expect(foundAlsoTest).not.toBeUndefined()
    expect(foundAlsoTest.test).toBe('it also finds this test')
    expect(foundAlsoTest.description).toStrictEqual([
      'test group',
      'nested group',
      'deeply nested group',
    ])
    expect(foundAlsoTest.expectations).toHaveLength(1)

    expect(foundLastTest).not.toBeUndefined()
    expect(foundLastTest.test).toBe('it finds this last test')
    expect(foundLastTest.description).toStrictEqual([
      'test group',
      'nested group',
    ])
    expect(foundLastTest.expectations).toHaveLength(1)

    expect(others).toHaveLength(0)
  })
})
