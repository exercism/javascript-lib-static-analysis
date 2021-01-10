import { AstParser } from '~src/AstParser'
import { extractFunctions } from '~src/extracts/extract_functions'
import { InlineInput } from '~src/input/InlineInput'

describe('extractFunctions', () => {
  describe('function declarations', () => {
    const functions = {
      supported: [
        [
          `function declaration() { return 42 }`,
          'declaration',
          { isGenerator: false, isAsync: false },
        ],
        [
          `function* declaration() { yield 42 }`,
          'declaration',
          { isGenerator: true, isAsync: false },
        ],
        [
          `async function declaration() { }`,
          'declaration',
          { isGenerator: false, isAsync: true },
        ],
        [
          `async function* declaration() { }`,
          'declaration',
          { isGenerator: true, isAsync: true },
        ],
      ] as const,
      unsupported: [],
    }

    functions.supported.forEach(([source, name, metadata]) => {
      test(`finds a function declaration, such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundFunction, ...others] = extractFunctions(program)

        expect(others).toHaveLength(0)
        expect(foundFunction).not.toBeUndefined()
        expect(foundFunction.name).toBe(name)
        expect(foundFunction.type).toBe('declaration')

        const keys = Object.keys(metadata) as (keyof typeof metadata)[]
        keys.forEach((key) => {
          const expected = metadata[key]
          expect(foundFunction.metadata[key]).toBe(expected)
        })
      })
    })
  })

  describe('variable declaration with (arrow) function expression', () => {
    const functions = {
      supported: [
        [
          `const named = function () { return 42 }`,
          'named',
          { isGenerator: false, isAsync: false },
          'const',
        ],
        [
          `const named = function* () { return 42 }`,
          'named',
          { isGenerator: true, isAsync: false },
          'const',
        ],
        [
          `const named = async function() { }`,
          'named',
          { isGenerator: false, isAsync: true },
          'const',
        ],
        [
          `const named = async function*() { }`,
          'named',
          { isGenerator: true, isAsync: true },
          'const',
        ],
        [
          `let named = function () { return 42 }`,
          'named',
          { isGenerator: false, isAsync: false },
          'let',
        ],
        [
          `let named = function* () { return 42 }`,
          'named',
          { isGenerator: true, isAsync: false },

          'let',
        ],
        [
          `let named = async function() { }`,
          'named',
          { isGenerator: false, isAsync: true },
          'let',
        ],
        [
          `let named = async function*() { }`,
          'named',
          { isGenerator: true, isAsync: true },
          'let',
        ],
        [
          `var named = function () { return 42 }`,
          'named',
          { isGenerator: false, isAsync: false },
          'var',
        ],
        [
          `var named = function* () { return 42 }`,
          'named',
          { isGenerator: true, isAsync: false },
          'var',
        ],
        [
          `var named = async function() { }`,
          'named',
          { isGenerator: false, isAsync: true },
          'var',
        ],
        [
          `var named = async function*() { }`,
          'named',
          { isGenerator: true, isAsync: true },
          'var',
        ],

        [
          `const named = () => { return 42 }`,
          'named',
          { isGenerator: false, isAsync: false },
          'const',
        ],
        [
          `const named = () => 42`,
          'named',
          { isGenerator: false, isAsync: false },
          'const',
        ],
        [
          `const named = async () => { }`,
          'named',
          { isGenerator: false, isAsync: true },
          'const',
        ],
        [
          `const named = async () => 42`,
          'named',
          { isGenerator: false, isAsync: true },
          'const',
        ],
        [
          `let named = () => { }`,
          'named',
          { isGenerator: false, isAsync: false },
          'let',
        ],
        [
          `var named = async () => { }`,
          'named',
          { isGenerator: false, isAsync: true },
          'var',
        ],
      ] as const,
      unsupported: [],
    }

    functions.supported.forEach(([source, name, metadata, kind]) => {
      test(`finds a ${kind} variable declaration with a(n) (arrow) function expression, such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundFunction, ...others] = extractFunctions(program)

        expect(others).toHaveLength(0)
        expect(foundFunction).not.toBeUndefined()
        expect(foundFunction.name).toBe(name)
        expect(foundFunction.type).toBe('expression')
        expect(foundFunction.metadata.variable).not.toBeUndefined()
        expect(foundFunction.metadata.variable?.kind).toBe(kind)

        const keys = Object.keys(metadata) as (keyof typeof metadata)[]
        keys.forEach((key) => {
          const expected = metadata[key]
          expect(foundFunction.metadata[key]).toBe(expected)
        })
      })
    })
  })

  describe('classes with functions', () => {
    const functions = {
      properties: [
        [
          `class Klazz { property = () => { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { property = async () => {}; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { property = function () { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { property = function* () { yield 42 }; }`,
          'property',
          { isAsync: false, isGenerator: true, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { property = async function () { }; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { property = async function* () { }; }`,
          'property',
          { isAsync: true, isGenerator: true, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { static property = () => { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static property = async () => {}; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static property = function () { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static property = function* () { yield 42 }; }`,
          'property',
          { isAsync: false, isGenerator: true, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static property = async function () { }; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static property = async function* () { }; }`,
          'property',
          { isAsync: true, isGenerator: true, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { [name] = () => {}; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { [name] = async () => {}; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { [name] = function () { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { [name] = function* () { yield 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { [name] = async function () { }; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { [name] = async function* () { }; }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: false },
          'class-property',
        ],
        [
          `class Klazz { static [name] = () => { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static [name] = async () => {}; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static [name] = function () { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static [name] = function* () { yield 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static [name] = async function () { }; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: true },
          'class-property',
        ],
        [
          `class Klazz { static [name] = async function* () { }; }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: true },
          'class-property',
        ],
      ] as const,
      methods: [
        [
          `class Klazz { constructor() { } }`,
          'constructor',
          { isAsync: false, isGenerator: false, isStatic: false },
          'constructor',
        ],
        [
          `class Klazz { get property() { return 42 } }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
          'getter',
        ],
        [
          `class Klazz { set property(value) { } }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
          'setter',
        ],
        [
          `class Klazz { shorthand() { return 42 } }`,
          'shorthand',
          { isAsync: false, isGenerator: false, isStatic: false },
          'method',
        ],
        [
          `class Klazz { *shorthand() { return 42 } }`,
          'shorthand',
          { isAsync: false, isGenerator: true, isStatic: false },
          'method',
        ],
        [
          `class Klazz { async shorthand() { } }`,
          'shorthand',
          { isAsync: true, isGenerator: false, isStatic: false },
          'method',
        ],
        [
          `class Klazz { async *shorthand() { } }`,
          'shorthand',
          { isAsync: true, isGenerator: true, isStatic: false },
          'method',
        ],
        [
          `class Klazz { [name]() { return 42 } }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: false },
          'method',
        ],
        [
          `class Klazz { *[name]() { yield 42 } }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: false },
          'method',
        ],
        [
          `class Klazz { async [name]() { } }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: false },
          'method',
        ],
        [
          `class Klazz { async *[name]() { } }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: false },
          'method',
        ],
        [
          `class Klazz { static shorthand() { return 42 } }`,
          'shorthand',
          { isAsync: false, isGenerator: false, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static *shorthand() { yield 42 } }`,
          'shorthand',
          { isAsync: false, isGenerator: true, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static async shorthand() {} }`,
          'shorthand',
          { isAsync: true, isGenerator: false, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static async *shorthand() {} }`,
          'shorthand',
          { isAsync: true, isGenerator: true, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static [name]() { return 42 } }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static *[name]() { yield 42 } }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static async [name]() { } }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: true },
          'method',
        ],
        [
          `class Klazz { static async *[name]() { } }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: true },
          'method',
        ],
      ] as const,
    }

    describe('class properties', () => {
      functions.properties.forEach(([source, name, metadata, kind]) => {
        test(`finds a ${kind}, such as "${source}"`, async () => {
          const input = new InlineInput([source])
          const [{ program }] = await AstParser.ANALYZER.parse(input)

          const [foundFunction, ...others] = extractFunctions(program)

          expect(others).toHaveLength(0)
          expect(foundFunction).not.toBeUndefined()
          expect(foundFunction.name).toBe(name)
          expect(foundFunction.type).toBe(kind)

          const keys = Object.keys(metadata) as (keyof typeof metadata)[]
          keys.forEach((key) => {
            const expected = metadata[key]
            expect(foundFunction.metadata[key]).toBe(expected)
          })
        })
      })
    })

    describe('class method definitions', () => {
      functions.methods.forEach(([source, name, metadata, kind]) => {
        test(`finds a ${kind}, such as "${source}"`, async () => {
          const input = new InlineInput([source])
          const [{ program }] = await AstParser.ANALYZER.parse(input)

          const [foundFunction, ...others] = extractFunctions(program)

          expect(others).toHaveLength(0)
          expect(foundFunction).not.toBeUndefined()
          expect(foundFunction.name).toBe(name)
          expect(foundFunction.type).toBe(kind)

          const keys = Object.keys(metadata) as (keyof typeof metadata)[]
          keys.forEach((key) => {
            const expected = metadata[key]
            expect(foundFunction.metadata[key]).toBe(expected)
          })
        })
      })
    })
  })

  describe('object property', () => {
    test('finds a function as an object property, such as "const collection = { shorthand() { return 42 } }"', async () => {
      const input = new InlineInput([
        `const collection = { shorthand() { return 42 } }`,
      ])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [foundFunction, ...others] = extractFunctions(program)

      expect(others).toHaveLength(0)
      expect(foundFunction).not.toBeUndefined()
      expect(foundFunction.name).toBe('shorthand')
      expect(foundFunction.type).toBe('property')
    })
  })

  describe('export default object', () => {
    test('finds a function exported as a default object property, such as "export default { name: () => {} }"', async () => {
      const input = new InlineInput(['export default { name: () => {} }'])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [foundFunction, ...others] = extractFunctions(program)

      expect(others).toHaveLength(0)
      expect(foundFunction).not.toBeUndefined()
      expect(foundFunction.name).toBe('name')
      expect(foundFunction.type).toBe('property')
    })
  })
})
