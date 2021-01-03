import { AstParser } from '~src/AstParser'
import { extractVariables } from '~src/extracts/extract_variables'
import { isLiteral } from '~src/guards/is_literal'
import { InlineInput } from '~src/input/InlineInput'

const literalsP = AstParser.ANALYZER.parse(
  new InlineInput([
    `const aLiteralString = 'literal'
const aString = new String('not a literal')
const aLiteralNumber = 42
const aLiteralBigInt = 42n
const aLiteralBoolean = true
const aLiteralRegExp = /literal/
const aLiteralNull = null`,
  ])
)

describe('isLiteral', () => {
  it('detects literal strings', async () => {
    const [{ program }] = await literalsP
    const variables = extractVariables(program)

    const aLiteralString = variables.find(
      (variable) => variable.name === 'aLiteralString'
    )

    // Invariant
    expect(aLiteralString).not.toBeUndefined()
    expect(aLiteralString!.init).not.toBeNull()

    // Test
    expect(isLiteral(aLiteralString!.init!)).toBe(true)
  })

  it('ignores boxed strings', async () => {
    const [{ program }] = await literalsP
    const variables = extractVariables(program)

    const aString = variables.find((variable) => variable.name === 'aString')

    // Invariant
    expect(aString).not.toBeUndefined()
    expect(aString!.init).not.toBeNull()

    // Test
    expect(isLiteral(aString!.init!)).toBe(false)
  })

  const LITERALS = {
    number: 'aLiteralNumber',
    biginit: 'aLiteralBigInt',
    boolean: 'aLiteralBoolean',
    regexp: 'aLiteralRegExp',
    null: 'aLiteralNull',
  }

  Object.keys(LITERALS).forEach((type) => {
    it(`detects literal ${type}s`, async () => {
      const [{ program }] = await literalsP
      const variables = extractVariables(program)

      const aLiteralString = variables.find(
        (variable) => variable.name === LITERALS[type as keyof typeof LITERALS]
      )

      // Invariant
      expect(aLiteralString).not.toBeUndefined()
      expect(aLiteralString!.init).not.toBeNull()

      // Test
      expect(isLiteral(aLiteralString!.init!)).toBe(true)
    })
  })
})
