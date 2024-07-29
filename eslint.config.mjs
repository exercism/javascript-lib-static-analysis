// @ts-check

import config from '@exercism/eslint-config-tooling'

export default [
  ...config,
  {
    ignores: [
      '.appends/**/*',
      '.github/**/*',
      '.vscode/**/*',
      '.yarn/**/*',
      'bin/**/*',
      'dist/**/*',
      'test/fixtures/**/*',
      '.pnp.*',
      'jest.config.js',
    ],
  },
]
