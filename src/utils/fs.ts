import fs from 'node:fs'

// Extact utilities
const { readFile, readdir, writeFile, stat } = fs.promises

export { readFile, readdir as readDir, writeFile, stat as exists }

// from 'fs/promises' doesn't work as of writing with jest' mocking.
