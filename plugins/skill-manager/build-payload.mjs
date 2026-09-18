#!/usr/bin/env node
/**
 * Assemble the cordis_define payload for this plugin.
 *
 * Both halves in this directory are the exact function BODIES a dynamic Cordis
 * Package takes as `code.host` / `code.client` — not modules, so they are read
 * as text and handed to the runtime verbatim. Parsing them here runs the same
 * check the runtime performs, which turns a syntax slip into a build failure
 * instead of a failed activation.
 *
 * Usage:
 *   node build-payload.mjs              # pretty JSON on stdout
 *   node build-payload.mjs --compact    # single-line JSON (what the tool wants)
 *   node build-payload.mjs --out p.json # write to a file
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const read = (name) => readFileSync(join(here, name), 'utf8')

const host = read('host.js')
const client = read('client.js')
const meta = JSON.parse(read('plugin.json'))

for (const [name, body] of [['host.js', host], ['client.js', client]]) {
  try {
    new Function(body)
  } catch (error) {
    console.error(`${name}: ${error.message}`)
    process.exit(1)
  }
}

const payload = {
  plugin: { kind: 'new', idPrefix: meta.idPrefix },
  name: meta.name,
  purpose: meta.summary,
  code: { host, client },
}

const argv = process.argv.slice(2)
const outIndex = argv.indexOf('--out')
const json = argv.includes('--compact') ? JSON.stringify(payload) : JSON.stringify(payload, null, 2)

if (outIndex >= 0 && argv[outIndex + 1] !== undefined) {
  writeFileSync(argv[outIndex + 1], json + '\n')
  console.error(`wrote ${argv[outIndex + 1]}`)
} else {
  process.stdout.write(json + '\n')
}
