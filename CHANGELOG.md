# Changelog

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
