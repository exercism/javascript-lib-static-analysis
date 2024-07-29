import { AstParser } from '~src/AstParser'
import { extractVariables } from '~src/extracts/extract_variables'
import { InlineInput } from '~src/input/InlineInput'

import { describe, it, expect } from '@jest/globals'

describe('extractVariables', () => {
  it('finds a top level variable', async () => {
    const input = new InlineInput(['const topLevel = 42;'])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const variables = extractVariables(program)

    expect(variables).toHaveLength(1)
    expect(variables[0].name).toBe('topLevel')
    expect(variables[0].kind).toBe('const')
    expect(variables[0].init).not.toBeNull()
  })

  const KINDS = ['let', 'const', 'var']

  KINDS.forEach((kind) => {
    it(`it finds a ${kind} declared variable`, async () => {
      const input = new InlineInput([`${kind} topLevel = 42;`])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [variable, ...others] = extractVariables(program)

      expect(others).toHaveLength(0)
      expect(variable.name).toBe('topLevel')
      expect(variable.kind).toBe(kind)
      expect(variable.init).not.toBeNull()
    })
  })

  it('finds a variable in a nested scope', async () => {
    const input = new InlineInput([
      `function twoFer() {
        const nestedVariable = 42;
      }`,
    ])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const [variable, ...others] = extractVariables(program)

    expect(others).toHaveLength(0)
    expect(variable.name).toBe('nestedVariable')
    expect(variable.kind).toBe('const')
    expect(variable.init).not.toBeNull()
  })

  it('finds multiple variables', async () => {
    const input = new InlineInput([
      `export const exportedVariable = "hello";

      function twoFer() {
        const nestedVariable = 42;
        const anotherNested = 'nest';
      }

      const topLevel = 9 * 9;
      const anotherTopLevel = null`,
    ])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const variables = extractVariables(program)

    expect(variables).toHaveLength(5)

    const names = variables.map((variable) => variable.name).sort()
    const expected = [
      'exportedVariable',
      'nestedVariable',
      'anotherNested',
      'topLevel',
      'anotherTopLevel',
    ].sort()

    expect(names).toEqual(expected)
  })

  it('finds array pattern declared variables', async () => {
    const input = new InlineInput([`const [first, second] = ['foo', 'bar'];`])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const [first, second, ...others] = extractVariables(program)

    expect(others).toHaveLength(0)
    expect(first.name).toBe('first')
    expect(first.kind).toBe('const')
    expect(first.init).not.toBeNull()

    expect(second.name).toBe('second')
    expect(second.kind).toBe('const')
    expect(second.init).not.toBeNull()
  })

  it('finds comma declared variables', async () => {
    const input = new InlineInput([`const first, second = 42;`])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const [first, second, ...others] = extractVariables(program)

    expect(others).toHaveLength(0)

    expect(first.name).toBe('first')
    expect(first.kind).toBe('const')
    expect(first.init).toBeNull()

    expect(second.name).toBe('second')
    expect(second.kind).toBe('const')
    expect(second.init).not.toBeNull()
  })

  it('finds late initialized variables', async () => {
    const input = new InlineInput([
      `let nothing;

      nothing = 'late';`,
    ])
    const [{ program }] = await AstParser.ANALYZER.parse(input)

    const [nothing, ...others] = extractVariables(program)

    expect(others).toHaveLength(0)

    expect(nothing.name).toBe('nothing')
    expect(nothing.kind).toBe('let')
    expect(nothing.init).toBeNull()
  })
})
