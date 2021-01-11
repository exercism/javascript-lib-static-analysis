# Changelog

## 0.7.0

- Add `body` to `ExtractedFunction`
- Move `params` from `ExtractedFunction.metadata` to `ExtractedFunction`

## 0.6.0

- Rename extract types to be unambiguously "extracted" values
- Add `extract_functions`
- Add `NoSourceAnnotation`
- Add base error `AnalysisError`

## 0.5.0

- Add re-exports. This increases file-size and potentially decreases tree-shakability, but oh boi does it increase the DX
- Change compilation target to node 12.x+, instead of current node
- Support `exports` (instead of only `module.exports`)

## 0.4.2

- Fix glue argument type for `TestCase#name`

## 0.4.1

- Add inline synchronous parsing for test reporter

## 0.4.0

~Incorrectly published package~

## 0.3.1

- Add strict typing to `AstTraverser`
- Remove duplicated `InlineInput` from test helpers

## 0.3.0

- Add extracts:
  - `extractTests`
  - `extractSource`
- Add exports for typeguard return types for `isCallExpression`
- Add helper functions to extract test code

## 0.2.0

- Add Traverser (with support for `break/stop` and `skip/shallow`)
- Add guards:
  - `isAssignmentPattern`
  - `isBinaryExpression`
  - `isCallExpression`
  - `isIdentifier`
  - `isLiteral`
  - `isLogicalExpression`
  - `isMemberExpression`
  - `isReturnBlockStatement`
  - `isTemplateLiteral`
  - `isUnaryExpression`
  - `isVariableDeclarationOfKind`
- Add queries:
  - `findAll`
  - `findFirstOfType`
  - `findFirst`
  - `findLiteral`
  - `findMemberCall`
  - `findNewExpression`
  - `findRawLiteral`
  - `findTopLevelConstant`
- Add extracts:
  - `extractExports`
  - `extractVariables`

## 0.1.0

Initial release
