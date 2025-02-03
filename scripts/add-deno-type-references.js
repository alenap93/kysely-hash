/**
 * This scripts adds a `/// <reference types="./file.d.ts" />` directive
 * at the beginning of each ESM JavaScript file so that they work with
 * deno.
 */

const fs = require('fs')
const path = require('path')

const ESM_DIST_PATH = path.join(__dirname, '..', 'dist')

function isDir(file) {
  return fs.lstatSync(file).isDirectory()
}

function forEachFile(dir, callback) {
  const files = fs.readdirSync(dir).filter((it) => it !== '.' && it !== '..')

  for (const file of files) {
    const filePath = path.join(dir, file)

    if (isDir(filePath)) {
      forEachFile(filePath, callback)
    } else {
      callback(filePath)
    }
  }
}

forEachFile(ESM_DIST_PATH, (filePath) => {
  if (filePath.endsWith('.mjs')) {
    const dTsFile = path.basename(filePath).replace(/\.mjs$/, '.d.mts')
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })

    fs.writeFileSync(
      filePath,
      `/// <reference types="./${dTsFile}" />\n${content}`,
    )
  }
})
