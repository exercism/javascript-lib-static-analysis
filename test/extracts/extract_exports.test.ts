import { AstParser } from '~src/AstParser'
import { ANONYMOUS, extractExports } from '~src/extracts/extract_exports'
import { InlineInput } from '~src/input/InlineInput'

import { describe, it, expect } from '@jest/globals'

describe('extractExports', () => {
  describe('export named declarations', () => {
    const exports = {
      supported: [
        [`export { name }`, 'name', 'name'],
        [`export { name as bar }`, 'name', 'bar'],
        [`export { name } from 'foo'`, 'foo.name', 'name'],
      ],
      unsupported: [],
    }

    exports.supported.forEach(([source, local, exported]) => {
      it(`finds a named export, such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe(local)
        expect(foundExport.local).toBe(local)
        expect(foundExport.exported).toBe(exported)
      })
    })
  })

  describe('export class declaration', () => {
    it(`finds an exported class, inline declared`, async () => {
      const input = new InlineInput(['export class Name {}'])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [foundExport, ...others] = extractExports(program)

      expect(others).toHaveLength(0)
      expect(foundExport).not.toBeUndefined()
      expect(foundExport.name).toBe('Name')
      expect(foundExport.local).toBe('Name')
      expect(foundExport.exported).toBe('Name')
    })
  })

  describe('export function declaration', () => {
    it(`finds an exported function, inline declared`, async () => {
      const input = new InlineInput(['export function name() {}'])
      const [{ program }] = await AstParser.ANALYZER.parse(input)

      const [foundExport, ...others] = extractExports(program)

      expect(others).toHaveLength(0)
      expect(foundExport).not.toBeUndefined()
      expect(foundExport.name).toBe('name')
      expect(foundExport.local).toBe('name')
      expect(foundExport.exported).toBe('name')
    })
  })

  describe('export variable declaration', () => {
    const exports = {
      supported: [
        [`export var name`, 'name'],
        [`export let name`, 'name'],
        [`export const name`, 'name'],
      ],
      unsupported: [],
    }

    exports.supported.forEach(([source, local]) => {
      it(`finds an exported variable, inline declared, such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe(local)
        expect(foundExport.local).toBe(local)
        expect(foundExport.exported).toBe(local)
      })
    })
  })

  describe('export typesript declarations', () => {
    const exports = {
      supported: [
        [`export interface Name {}`, 'Name'],
        [`export declare interface Name {}`, 'Name'],
        [`export type Name = {}`, 'Name'],
        [`export declare type Name = {}`, 'Name'],
      ],
      unsupported: [],
    }

    exports.supported.forEach(([source, local]) => {
      it(`finds a typescript export such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe(local)
        expect(foundExport.local).toBe(local)
        expect(foundExport.exported).toBe(local)
      })
    })
  })

  describe('export * (all)', () => {
    const exports = {
      supported: [
        [`export * from 'bar'`, '*'],
        [`export * as name from 'bar'`, 'name'],
      ],
      unsupported: [],
    }

    exports.supported.forEach(([source, exported]) => {
      it(`finds a namespace/all export such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe('*')
        expect(foundExport.local).toBe('*')
        expect(foundExport.exported).toBe(exported)
      })
    })
  })

  describe('export default', () => {
    const exports = {
      supported: [
        [`export default name`, 'name'],
        [`export default class Name {}`, 'Name'],
        [`export default class {}`, ANONYMOUS],
        [`export default function Name() {}`, 'Name'],
        [`export default function () {}`, ANONYMOUS],
        [`export default () => {}`, ANONYMOUS],
        [`export default interface Name {}`, 'Name'],
      ],
      unsupported: [
        [`export default { name }`, 'name'],
        [`export default [ name ]`, 'name'],
      ],
    }

    exports.supported.forEach(([source, local]) => {
      it(`finds a default export such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe(local)
        expect(foundExport.local).toBe(local)
        expect(foundExport.exported).toBe('default')
      })
    })
  })

  describe('module.exports', () => {
    const exports = {
      supported: [
        [`module.exports = { name }`, 'name', 'name'],
        [`module.exports.name = name`, 'name', 'name'],
        [`module.exports = { bar: name }`, 'name', 'bar'],
        [`module.exports.bar = name`, 'name', 'bar'],
        [`exports.name = name`, 'name', 'name'],
        [`exports.bar = name`, 'name', 'bar'],
        [`exports.bar = function name() {}`, 'name', 'bar'],
      ],
      unsupported: [[`exports = module.exports = { name }`, 'name', 'name']],
    }

    exports.supported.forEach(([source, local, exported]) => {
      it(`finds a module.exports export such as "${source}"`, async () => {
        const input = new InlineInput([source])
        const [{ program }] = await AstParser.ANALYZER.parse(input)

        const [foundExport, ...others] = extractExports(program)

        expect(others).toHaveLength(0)
        expect(foundExport).not.toBeUndefined()
        expect(foundExport.name).toBe(local)
        expect(foundExport.local).toBe(local)
        expect(foundExport.exported).toBe(exported)
      })
    })
  })
})
