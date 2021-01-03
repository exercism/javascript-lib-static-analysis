import { AstParser } from '~src/AstParser'
import { InlineInput } from '~src/input/InlineInput'

const INPUT = new InlineInput([
  `
/**
 * Whofer? twoFer!
 * @param name the name who it's for, if not for me
 */
 export function twoFer(name = 'you') {
   return \`One for \${name} and one for me.\`;
 }
`.trim(),
])

const INPUT_NO_COMMENT = new InlineInput([
  `
 export function twoFer(name = 'you') {

  return \`One for \${name} and one for me.\`; }
`.trim(),
])

describe('AstParser', () => {
  it('parses code', async () => {
    const parser = new AstParser()

    const parsed = await parser.parse(INPUT)

    expect(parsed.length).toBe(1)
    expect(parsed[0].program.body.length).not.toBe(0)
  })

  it('ignores loc and comments by default', async () => {
    const parser = new AstParser()
    const [{ program }] = await parser.parse(INPUT)

    expect(program.comments).toBeUndefined()
    expect(program.loc).toBeUndefined()
  })

  it('allows settings parse options', async () => {
    const parser = new AstParser({ comment: true, loc: true })
    const [{ program }] = await parser.parse(INPUT)

    expect(program.comments).not.toBeUndefined()
    expect(program.loc).not.toBeUndefined()
  })

  describe('Representations', () => {
    it('has stable representations', async () => {
      const parser = AstParser.REPRESENTER
      const [{ program: program1 }] = await parser.parse(INPUT)
      const [{ program: program2 }] = await parser.parse(INPUT)

      expect(program1).toEqual(program2)
    })

    it('has location agnostic representations', async () => {
      const parser = AstParser.REPRESENTER
      const [{ program: program1 }] = await parser.parse(INPUT)
      const [{ program: program2 }] = await parser.parse(INPUT_NO_COMMENT)

      expect(program1).toEqual(program2)
    })
  })

  describe('Analysis', () => {
    it('has stable analysis', async () => {
      const parser = AstParser.ANALYZER
      const [{ program: program1 }] = await parser.parse(INPUT)
      const [{ program: program2 }] = await parser.parse(INPUT)

      expect(program1).toEqual(program2)
    })

    it('has locations recorded after analysis', async () => {
      const parser = AstParser.ANALYZER
      const [{ program: program1 }] = await parser.parse(INPUT)
      const [{ program: program2 }] = await parser.parse(INPUT_NO_COMMENT)

      expect(program1).not.toEqual(program2)
    })
  })
})
