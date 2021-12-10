# @exercism/static-analysis

> You can use [AstExplorer](https://astexplorer.net/) to preview the output of the parser.

## Installation

> You need at least Node 12.x in order to maintain or use this library. This is due to the fact that babel is configured to polyfill as if you're running Node 12.x or higher. `jest` will fail to run the tests if you run a lower node, and some of the code might not be transpiled correctly. If you _MUST_ use this library in conjunction with a lower Node version, ensure to re-transpile this module.

Add this library to your project in `package.json`, for example via:

```shellscript
yarn add @exercism/static-analysis
```

## Usage

> Note: all types such as `Node` are **not** imported from `'typescript'`, but rather from `'@typescript-eslint/typescript-estree'` in order to increase compatibility with tooling and normalisation of the output tree. Types such as `Node` all live on a single export from that package called `TSESTree`.

In order to perform statical analysis on estree compatible languages (such as JavaScript or TypeScript), a source first needs to be parsed. This can be accomplished using the `AstParser`:

```typescript
import { AstParser } from '@exercism/statis-analysis/dist/AstParser'
import { InlineInput } from '@exercism/static-analysis/dist/input/InlineInput'

const input = new InlineInput(['const topLevel = 42;'])
const [{ program, source }] = await AstParser.ANALYZER.parse(input)
```

Any compatible `Input` works, made available to you are:

- [`FileInput`](https://github.com/exercism/javascript-lib-static-analysis/blob/main/src/input/FileInput.ts) which takes a file path
- [`DirectoryInput`](https://github.com/exercism/javascript-lib-static-analysis/blob/main/src/input/DirectoryInput.ts) which takes a directory, and uses the `TrackOptions` to filter them out
- [`InlineInput`](https://github.com/exercism/javascript-lib-static-analysis/blob/main/src/input/InlineInput.ts) which takes inline string(s) as source(s)

By default, the `AstParser` will only parse a single file, but it's possible to parse as many files as necessary. In the case of `DirectoryInput`, it will search for the most applicable file, based on the `TrackOptions`.

### Parsers

The parsers with recommended configuration for certain jobs are assigned as static properties.

- [`AstParser.ANALYZER`](https://github.com/exercism/javascript-lib-static-analysis/blob/main/src/AstParser.ts#L96-L101): Holds a parser that is recommended for analysis. This means that it dóés hold locational information (in order to be able to extract tokens), but does not hold any commentary. You **can** `extractSource` code using this parser.
- [`AstParser.REPRESENTER`](https://github.com/exercism/javascript-lib-static-analysis/blob/main/src/AstParser.ts#L85-L90): Holds a parser that is recommended for representing. This means that it does not hold locational information (where differences are caused by whitespace differences) or commentary. You **cannot** `extractSource` code using this parser.
- `new AstParser(options, n)`: Setup your own parser, which also allows to parse more than one file by changing the `n` variable.

### Guards

Guards are named helpers that also work as [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types). You can find them [here](https://github.com/exercism/javascript-lib-static-analysis/tree/main/src/guards), and they are imported like this:

```typescript
import { guardIdentifier } from '@exercism/statis-analysis'
import { guardLiteral } from '@exercism/statis-analysis'
import { guardMemberExpression } from '@exercism/statis-analysis'
// etc
```

### Queries

Queries utilise the `AstTraverser` to find and/or collect certain node(s). You can find them [here](https://github.com/exercism/javascript-lib-static-analysis/tree/main/src/queries), and the are imported like this:

```typescript
import { findFirst } from '@exercism/statis-analysis'
// etc
```

Manual traversing is also possible using the more low-level `AstTraverser` (and `traverse` helper function):

```typescript
import { traverse } from '@exercism/static-analysis'

traverse(root, {
  enter(node): void {
    // When a node is entered
  },

  exit(node): void {
    // when a node is exited
  },

  [AST_NODE_TYPES.ArrayExpression]: void (
    {
      // when a node with node.type === AST_NODE_TYPES.ArrayExpression is entered
    }
  ),
})
```

All the functions (`enter`, `exit`, `[type]`) are optional. _Inside_ each function, you can use the following:

- `this.skip()` to prevent the traverser from traversing a node's _children_.
- `this.break()` to stop traversing.

### Extracts

It's also possible to extract certain common items from a source or subtree.

- `extractExports`
- `extractSource`
- `extractTests`
- `extractVariables`
