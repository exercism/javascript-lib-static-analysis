import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import { AstParser } from '~src/AstParser'
import { extractFunctions } from '~src/extracts/extract_functions'
import { InlineInput } from '~src/input/InlineInput'

describe('extractFunctions', () => {
  test.only('smoke test', () => {
    const [{ program, source }] = AstParser.ANALYZER.parseSync(
      'function twoFer(name="you") { return `One for ${you}, one for me.` }'
    )
    const [twoFer] = extractFunctions(program)

    expect(twoFer).not.toBeUndefined()
    expect(twoFer.name).toBe('twoFer')
    expect(twoFer.body).not.toBeUndefined()
    expect(twoFer.body.range).toStrictEqual([
      source.indexOf('{'),
      source.lastIndexOf('}') + 1,
    ])
    expect(twoFer.params).toHaveLength(1)
    expect(twoFer.params[0].type).toBe(AST_NODE_TYPES.AssignmentPattern)
    expect(twoFer.node.range).toStrictEqual([0, source.length])
  })

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

    describe('finds a function declaration', () => {
      functions.supported.forEach(([source, name, metadata]) => {
        test(`such as "${source}"`, async () => {
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

    describe('finds a variable declaration with a(n) (arrow) function expression', () => {
      functions.supported.forEach(([source, name, metadata, kind]) => {
        test(`of kind ${kind}, such as "${source}"`, async () => {
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
  })

  describe('classes with functions', () => {
    const functions = {
      properties: [
        [
          `class Klazz { property = () => { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { property = async () => {}; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { property = function () { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { property = function* () { yield 42 }; }`,
          'property',
          { isAsync: false, isGenerator: true, isStatic: false },
        ],
        [
          `class Klazz { property = async function () { }; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { property = async function* () { }; }`,
          'property',
          { isAsync: true, isGenerator: true, isStatic: false },
        ],
        [
          `class Klazz { static property = () => { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static property = async () => {}; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static property = function () { return 42 }; }`,
          'property',
          { isAsync: false, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static property = function* () { yield 42 }; }`,
          'property',
          { isAsync: false, isGenerator: true, isStatic: true },
        ],
        [
          `class Klazz { static property = async function () { }; }`,
          'property',
          { isAsync: true, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static property = async function* () { }; }`,
          'property',
          { isAsync: true, isGenerator: true, isStatic: true },
        ],
        [
          `class Klazz { [name] = () => {}; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { [name] = async () => {}; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { [name] = function () { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { [name] = function* () { yield 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: false },
        ],
        [
          `class Klazz { [name] = async function () { }; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: false },
        ],
        [
          `class Klazz { [name] = async function* () { }; }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: false },
        ],
        [
          `class Klazz { static [name] = () => { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static [name] = async () => {}; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static [name] = function () { return 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static [name] = function* () { yield 42 }; }`,
          undefined,
          { isAsync: false, isGenerator: true, isStatic: true },
        ],
        [
          `class Klazz { static [name] = async function () { }; }`,
          undefined,
          { isAsync: true, isGenerator: false, isStatic: true },
        ],
        [
          `class Klazz { static [name] = async function* () { }; }`,
          undefined,
          { isAsync: true, isGenerator: true, isStatic: true },
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
      proto: [
        [
          `Klazz.prototype.fn = () => { }`,
          'fn',
          { isAsync: false, isGenerator: false },
        ],
        [
          `Klazz.prototype.fn = async () => { }`,
          'fn',
          { isAsync: true, isGenerator: false },
        ],
        [
          `Klazz.prototype.fn = function () { }`,
          'fn',
          { isAsync: false, isGenerator: false },
        ],
        [
          `Klazz.prototype.fn = function* () { }`,
          'fn',
          { isAsync: false, isGenerator: true },
        ],
        [
          `Klazz.prototype.fn = async function () { }`,
          'fn',
          { isAsync: true, isGenerator: false },
        ],
        [
          `Klazz.prototype.fn = async function* () { }`,
          'fn',
          { isAsync: true, isGenerator: true },
        ],
      ] as const,
    }

    describe('class properties', () => {
      describe(`finds a class-property`, () => {
        functions.properties.forEach(([source, name, metadata]) => {
          test(`such as "${source}"`, async () => {
            const input = new InlineInput([source])
            const [{ program }] = await AstParser.ANALYZER.parse(input)

            const [foundFunction, ...others] = extractFunctions(program)

            expect(others).toHaveLength(0)
            expect(foundFunction).not.toBeUndefined()
            expect(foundFunction.name).toBe(name)
            expect(foundFunction.type).toBe('class-property')
            expect(foundFunction.metadata.klazz).toBe('Klazz')

            const keys = Object.keys(metadata) as (keyof typeof metadata)[]
            keys.forEach((key) => {
              const expected = metadata[key]
              expect(foundFunction.metadata[key]).toBe(expected)
            })
          })
        })
      })
    })

    describe('class method definitions', () => {
      describe(`finds a method`, () => {
        functions.methods.forEach(([source, name, metadata, kind]) => {
          test(`a ${kind}, such as "${source}"`, async () => {
            const input = new InlineInput([source])
            const [{ program }] = await AstParser.ANALYZER.parse(input)

            const [foundFunction, ...others] = extractFunctions(program)

            expect(others).toHaveLength(0)
            expect(foundFunction).not.toBeUndefined()
            expect(foundFunction.name).toBe(name)
            expect(foundFunction.type).toBe(kind)
            expect(foundFunction.metadata.klazz).toBe('Klazz')

            const keys = Object.keys(metadata) as (keyof typeof metadata)[]
            keys.forEach((key) => {
              const expected = metadata[key]
              expect(foundFunction.metadata[key]).toBe(expected)
            })
          })
        })
      })
    })

    describe('class prototype assignments', () => {
      describe('finds a prototype-assignment', () => {
        functions.proto.forEach(([source, name, metadata]) => {
          test(`such as "${source}"`, async () => {
            const input = new InlineInput([source])
            const [{ program }] = await AstParser.ANALYZER.parse(input)

            const [foundFunction, ...others] = extractFunctions(program)

            expect(others).toHaveLength(0)
            expect(foundFunction).not.toBeUndefined()
            expect(foundFunction.name).toBe(name)
            expect(foundFunction.type).toBe('prototype-assignment')
            expect(foundFunction.metadata.klazz).toBe('Klazz')

            const keys = Object.keys(metadata) as (keyof typeof metadata)[]
            keys.forEach((key) => {
              const expected = metadata[key]
              expect(foundFunction.metadata[key]).toBe(expected)
            })
          })
        })
      })
    })
  })

  describe('object property', () => {
    const functions = {
      supported: [
        [`const collection = { shorthand() { return 42 } }`, 'shorthand'],
        [`const collection = { *shorthand() { yield 42 } }`, 'shorthand'],
        [`const collection = { async shorthand() { } }`, 'shorthand'],
        [`const collection = { async *shorthand() { } }`, 'shorthand'],

        [`const collection = { [computed]() { return 42 } }`, undefined],
        [`const collection = { *[computed]() { yield 42 } }`, undefined],
        [`const collection = { async [computed]() { } }`, undefined],
        [`const collection = { async *[computed]() { } }`, undefined],

        [`const collection = { property: () => { return 42 } }`, 'property'],
        [`const collection = { property: async () => {}  }`, 'property'],
        [
          `const collection = { property: function () { return 42 }  }`,
          'property',
        ],
        [
          `const collection = { property: function* () { yield 42 }  }`,
          'property',
        ],
        [`const collection = { property: async function () {}  }`, 'property'],
        [`const collection = { property: async function* () {}  }`, 'property'],

        [`const collection = { [computed]: () => { return 42 }  }`, undefined],
        [`const collection = { [computed]: async () => {}  }`, undefined],
        [
          `const collection = { [computed]: function () { return 42 }  }`,
          undefined,
        ],
        [
          `const collection = { [computed]: function* () { yield 42 }  }`,
          undefined,
        ],
        [`const collection = { [computed]: async function () {}  }`, undefined],
        [
          `const collection = { [computed]: async function* () {}  }`,
          undefined,
        ],
      ] as const,
    }

    describe('finds a function as an object property', () => {
      functions.supported.forEach(([source, name]) => {
        test(`such as "${source}"`, async () => {
          const input = new InlineInput([source])
          const [{ program }] = await AstParser.ANALYZER.parse(input)

          const [foundFunction, ...others] = extractFunctions(program)

          expect(others).toHaveLength(0)
          expect(foundFunction).not.toBeUndefined()
          expect(foundFunction.name).toBe(name)
          expect(foundFunction.type).toBe('property')
        })
      })
    })
  })

  describe('export default object', () => {
    const functions = {
      supported: [
        [`export default { name: () => {} }`, 'name'],
        [`export default { name: async () => {} }`, 'name'],
        [`export default { name: function () {} }`, 'name'],
        [`export default { name: function* () {} }`, 'name'],
        [`export default { name: async function () {} }`, 'name'],
        [`export default { name: async function* () {} }`, 'name'],

        [`export default { [computed]: () => {} }`, undefined],
        [`export default { [computed]: async () => {} }`, undefined],
        [`export default { [computed]: function () {} }`, undefined],
        [`export default { [computed]: function* () {} }`, undefined],
        [`export default { [computed]: async function () {} }`, undefined],
        [`export default { [computed]: async function* () {} }`, undefined],

        [`export default { name() {} }`, 'name'],
        [`export default { *name() {} }`, 'name'],
        [`export default { async name() {} }`, 'name'],
        [`export default { async *name() {} }`, 'name'],

        [`export default { [computed]() {} }`, undefined],
        [`export default { *[computed]() {} }`, undefined],
        [`export default { async [computed]() {} }`, undefined],
        [`export default { async *[computed]() {} }`, undefined],
      ] as const,
    }

    describe('finds a function exported as a default object property', () => {
      functions.supported.forEach(([source, name]) => {
        test(`such as "${source}"`, async () => {
          const input = new InlineInput([source])
          const [{ program }] = await AstParser.ANALYZER.parse(input)

          const [foundFunction, ...others] = extractFunctions(program)

          expect(others).toHaveLength(0)
          expect(foundFunction).not.toBeUndefined()
          expect(foundFunction.name).toBe(name)
          expect(foundFunction.type).toBe('property')
        })
      })
    })
  })

  describe('multiple functions', () => {
    test('finds them all', async () => {
      const [{ program }] = AstParser.ANALYZER.parseSync(`
function declaration() { return 42 }
const declaration2 = function* hiddenName() { yield 42 }
const declaration3 = () => { return 42 }

const collection = {
  shorthand() { return 42 },
  property: async () => {},
  [computed]: function* () { yield 42 },
}

Klazz.prototype.fn = () => { }`)

      const [fn1, fn2, fn3, fn4, fn5, fn6, fn7, ...others] = extractFunctions(
        program
      )
      expect(others).toHaveLength(0)
      expect(fn7).not.toBeUndefined()

      expect(fn1.name).toBe('declaration')
      expect(fn2.name).toBe('declaration2')
      expect(fn3.name).toBe('declaration3')
      expect(fn4.name).toBe('shorthand')
      expect(fn5.name).toBe('property')
      expect(fn6.name).toBe(undefined)
      expect(fn7.name).toBe('fn')
    })

    test('ignores nested functions', async () => {
      const [{ program }] = AstParser.ANALYZER.parseSync(`
function declaration() { return () => {} }
const declaration2 = function* hiddenName() { yield function () {} }
const declaration3 = () => { return () => 42 }

const collection = {
  shorthand() { return () => () => {} },
  property: async () => { function nope() {} },
  [computed]: function* () { function nope() {} },
}

Klazz.prototype.fn = () => { return () => {} }`)

      const [fn1, fn2, fn3, fn4, fn5, fn6, fn7, ...others] = extractFunctions(
        program
      )
      expect(others).toHaveLength(0)
      expect(fn7).not.toBeUndefined()

      expect(fn1.name).toBe('declaration')
      expect(fn2.name).toBe('declaration2')
      expect(fn3.name).toBe('declaration3')
      expect(fn4.name).toBe('shorthand')
      expect(fn5.name).toBe('property')
      expect(fn6.name).toBe(undefined)
      expect(fn7.name).toBe('fn')
    })
  })
})
