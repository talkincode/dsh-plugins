#!/usr/bin/env node
/**
 * skill-manager 的离线端到端验证。
 *
 * 为什么可以离线跑：Host 半边是一个纯函数体，只依赖注入进来的 `ctx`（`skills` /
 * `fs` / `shell`）与 `harness`。这里用真文件系统 + 真 bash 做 `fs` / `shell` 的
 * 适配，用固定的假目录当技能根，于是 discovery → read → save → create → delete
 * 的完整链路可以在一台没有任何 DSH 进程的机器上复现。
 *
 * 覆盖（对应 docs/roadmap.md 验收矩阵里本插件那一行）：
 *   Happy Path   bootstrap 发现技能 → read 读取 → save 保存描述 → 列表即时反映
 *                → create 新建 → 再 bootstrap 能看到 → delete 删除
 *   失败路径     read 未登记路径 / save·delete 只读技能 / create 重复名与非法名
 *   纯函数       client.js 的 frontmatter 解析与重组往返（含引号、冒号的描述）
 *
 * 用法：node plugins/skill-manager/verify.mjs
 * 退出码：0 全部通过，1 有失败。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const hostSource = readFileSync(join(here, 'host.js'), 'utf8')
const clientSource = readFileSync(join(here, 'client.js'), 'utf8')

let checks = 0
let failures = 0

function check(label, condition, detail) {
  checks += 1
  if (condition) {
    console.log('  ok    ' + label)
  } else {
    failures += 1
    console.log('  FAIL  ' + label + (detail === undefined ? '' : '  → ' + detail))
  }
}

function section(title) {
  console.log('\n' + title)
}

// ── 临时工作区：假的 HOME、假的工作区、一个用户技能、一个只读的内置技能 ────────

const root = mkdtempSync(join(tmpdir(), 'skill-manager-verify-'))
const fakeHome = join(root, 'home')
const fakeCwd = join(root, 'workspace')
const userRoot = join(fakeHome, '.agents', 'skills')
const bundledRoot = join(root, 'bundled', 'preset-skills')
const userSkillDir = join(userRoot, 'animejs')
const bundledSkillDir = join(bundledRoot, 'cordis-plugin-development')

const USER_SKILL = [
  '---',
  'name: animejs',
  'description: 动画适配说明（示例）',
  'whenToUse: 需要逐帧可控动画时',
  '---',
  '',
  '# animejs',
  '',
  '- 示例条目',
  '',
].join('\n')

const BUNDLED_SKILL = [
  '---',
  'name: cordis-plugin-development',
  'description: 内置只读技能（示例）',
  '---',
  '',
  '# cordis-plugin-development',
  '',
].join('\n')

mkdirSync(userSkillDir, { recursive: true })
mkdirSync(bundledSkillDir, { recursive: true })
mkdirSync(fakeCwd, { recursive: true })
writeFileSync(join(userSkillDir, 'SKILL.md'), USER_SKILL)
writeFileSync(join(bundledSkillDir, 'SKILL.md'), BUNDLED_SKILL)

// ── 依赖适配：fs 用真文件系统，shell 用真 bash，只有环境探测回答假的 HOME/PWD ──

function makeFileSystem() {
  const target = (path) => ({ targetKey: path, displayPath: path })
  return {
    async resolve(path) { return target(path) },
    processPath(t) { return t.displayPath },
    async stat(t) {
      try {
        const info = statSync(t.displayPath)
        return {
          version: 'v1',
          type: info.isDirectory() ? 'directory' : info.isFile() ? 'file' : 'other',
          size: info.size,
        }
      } catch (error) {
        return undefined
      }
    },
    async readText(t) { return readFileSync(t.displayPath, 'utf8') },
    async listDir(t) {
      return readdirSync(t.displayPath, { withFileTypes: true }).map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
        target: target(join(t.displayPath, entry.name)),
      }))
    },
    async writeText(t, content) {
      const existed = existsSync(t.displayPath)
      const before = existed ? readFileSync(t.displayPath, 'utf8') : null
      writeFileSync(t.displayPath, content)
      return { operation: existed ? 'update' : 'create', version: 'v2', before: before, after: content }
    },
  }
}

function makeShell() {
  return {
    resolve(request) { return request },
    async run(spec) {
      // 环境探测：这两行永远回答这次验证的假 HOME / 假 PWD，其余命令真跑。
      if (spec.command.indexOf('printf') === 0) {
        return { exitCode: 0, stdout: { text: fakeHome + '\n' + fakeCwd }, stderr: { text: '' } }
      }
      try {
        const output = execFileSync('/bin/bash', ['-c', spec.command], { encoding: 'utf8' })
        return { exitCode: 0, stdout: { text: output }, stderr: { text: '' } }
      } catch (error) {
        return {
          exitCode: typeof error.status === 'number' ? error.status : 1,
          stdout: { text: '' },
          stderr: { text: String(error.stderr || error.message) },
        }
      }
    },
  }
}

// 技能目录：固定两份候选，一份用户可写、一份内置只读。
function makeSkills() {
  return {
    async list() {
      return [
        {
          name: 'animejs',
          description: '动画适配说明（示例）',
          source: 'user-agents',
          provider: 'filesystem',
          path: join(userSkillDir, 'SKILL.md'),
          resourceBase: { kind: 'directory', path: userSkillDir },
        },
        {
          name: 'cordis-plugin-development',
          description: '内置只读技能（示例）',
          source: 'bundled',
          provider: 'filesystem',
          path: join(bundledSkillDir, 'SKILL.md'),
          resourceBase: { kind: 'directory', path: bundledSkillDir },
        },
      ]
    },
  }
}

function buildHost() {
  const handlers = {}
  const harness = { handle(method, fn) { handlers[method] = fn } }
  const fs = makeFileSystem()
  const shell = makeShell()
  const skills = makeSkills()
  const ctx = {
    get(name) {
      if (name === 'fs') return fs
      if (name === 'shell') return shell
      if (name === 'skills') return skills
      return undefined
    },
  }
  const plugin = new Function('harness', 'console', hostSource)(harness, console)
  plugin.apply(ctx)
  return handlers
}

// ── client.js 的纯函数：按标记切片求值，标记缺失就让验证失败而不是静默跳过 ──────

function loadClientPure() {
  const start = clientSource.indexOf('function unquoteScalar(')
  const end = clientSource.indexOf('function renderInline(')
  if (start < 0 || end <= start) {
    throw new Error('client.js 中找不到 unquoteScalar / renderInline 标记，无法提取 frontmatter 纯函数')
  }
  const slice = clientSource.slice(start, end)
  return new Function(slice + '\nreturn { parseDoc: parseDoc, composeDoc: composeDoc }')()
}

// ── 断言 ──────────────────────────────────────────────────────────────────────

async function main() {
  const handlers = buildHost()

  section('注册面')
  check('注册了 5 个 Package 私有 RPC', ['bootstrap', 'read', 'save', 'create', 'delete'].every((name) => typeof handlers[name] === 'function'),
    Object.keys(handlers).join(', '))

  section('Happy Path：发现 → 读取 → 保存 → 新建 → 删除')

  const boot = await handlers.bootstrap({})
  check('bootstrap 成功', boot.ok === true, boot.error)
  check('发现 2 个技能', boot.skills.length === 2, String(boot.skills.length))
  check('识别出可写的用户技能', boot.skills.filter((s) => s.editable === true).length === 1)
  check('内置技能标记为只读', boot.skills.filter((s) => s.source === 'bundled')[0].editable === false)
  check('技能根目录探测正确', boot.home === fakeHome, boot.home)
  check('新建目标含用户技能目录', boot.targets.some((t) => t.path === userRoot), JSON.stringify(boot.targets.map((t) => t.path)))

  const userFile = boot.skills.filter((s) => s.name === 'animejs')[0].file
  const read = await handlers.read({ file: userFile })
  check('read 读回原文', read.ok === true && read.content === USER_SKILL, read.error)

  const pure = loadClientPure()
  const parsed = pure.parseDoc(read.content)
  check('解析出 frontmatter', parsed.front === true && parsed.name === 'animejs')
  check('解析出 description', parsed.description === '动画适配说明（示例）', parsed.description)

  const tricky = '含 "引号"、冒号: 与 # 井号的描述'
  const composed = pure.composeDoc(parsed, { description: tricky })
  const reparsed = pure.parseDoc(composed)
  check('描述往返无损', reparsed.description === tricky, reparsed.description)
  check('其它 frontmatter 字段保留', reparsed.frontLines.some((line) => line.indexOf('whenToUse:') === 0))
  check('正文未被改动', reparsed.body === parsed.body)
  const twice = pure.composeDoc(pure.parseDoc(composed), { description: tricky })
  check('重复重组不漂移', twice === composed)

  const saved = await handlers.save({ file: userFile, content: composed, description: tricky })
  check('save 成功', saved.ok === true, saved.error)
  check('落盘内容与提交内容一致', readFileSync(userFile, 'utf8') === composed)

  const bootAfterSave = await handlers.bootstrap({})
  const savedEntry = bootAfterSave.skills.filter((s) => s.name === 'animejs')[0]
  check('列表立即反映新描述', savedEntry.description === tricky, savedEntry.description)

  const created = await handlers.create({ name: 'verify-temp-skill', description: '验证用临时技能', root: userRoot })
  check('create 成功', created.ok === true, created.error)
  check('create 落盘', existsSync(created.file) === true, created.file)
  check('create 目录未重复建', created.dir === join(userRoot, 'verify-temp-skill'))

  const bootAfterCreate = await handlers.bootstrap({})
  const createdEntry = bootAfterCreate.skills.filter((s) => s.name === 'verify-temp-skill')[0]
  check('新建技能进入列表', createdEntry !== undefined && createdEntry.editable === true)
  check('新建描述写入 frontmatter', readFileSync(created.file, 'utf8').indexOf('description: 验证用临时技能') > 0)

  const removed = await handlers.delete({ file: created.file })
  check('delete 成功', removed.ok === true, removed.error)
  check('delete 真的删掉了目录', existsSync(created.dir) === false)

  const bootAfterDelete = await handlers.bootstrap({})
  check('删除后列表不再包含它', bootAfterDelete.skills.every((s) => s.name !== 'verify-temp-skill'))

  section('失败路径')

  const outsideRead = await handlers.read({ file: '/etc/hosts' })
  check('read 拒绝未登记路径', outsideRead.ok === false && outsideRead.error.indexOf('清单') >= 0, outsideRead.error)

  const traversalRead = await handlers.read({ file: join(userRoot, '..', '..', '..', 'etc', 'hosts') })
  check('read 拒绝越权相对路径', traversalRead.ok === false, traversalRead.error)

  const bundledEntry = boot.skills.filter((s) => s.source === 'bundled')[0]
  const bundledSave = await handlers.save({ file: bundledEntry.file, content: 'x', description: 'x' })
  check('save 拒绝只读技能', bundledSave.ok === false && bundledSave.error.indexOf('只读') >= 0, bundledSave.error)
  check('只读技能未被改写', readFileSync(join(bundledSkillDir, 'SKILL.md'), 'utf8') === BUNDLED_SKILL)

  const bundledDelete = await handlers.delete({ file: bundledEntry.file })
  check('delete 拒绝只读技能', bundledDelete.ok === false && bundledDelete.error.indexOf('只读') >= 0, bundledDelete.error)
  check('只读技能目录仍在', existsSync(bundledSkillDir) === true)

  const duplicate = await handlers.create({ name: 'animejs', description: 'x', root: userRoot })
  check('create 拒绝重名', duplicate.ok === false && duplicate.error.indexOf('已存在') >= 0, duplicate.error)

  const badName = await handlers.create({ name: '../escape', description: 'x', root: userRoot })
  check('create 拒绝路径穿越的技能名', badName.ok === false, badName.error)

  const badCase = await handlers.create({ name: 'Not Kebab', description: 'x', root: userRoot })
  check('create 拒绝非 kebab-case 技能名', badCase.ok === false, badCase.error)
  check('非法创建未留下目录', existsSync(join(userRoot, '..', 'escape')) === false)

  const unknownSave = await handlers.save({ file: join(userRoot, 'ghost', 'SKILL.md'), content: 'x' })
  check('save 拒绝未登记文件', unknownSave.ok === false, unknownSave.error)

  section('回滚：删除后重新创建同名技能')
  const recreated = await handlers.create({ name: 'verify-temp-skill', description: '再次创建', root: userRoot })
  check('删除后可重建同名技能', recreated.ok === true, recreated.error)
  await handlers.delete({ file: recreated.file })
  check('重建后可再次删除', existsSync(recreated.dir) === false)
}

try {
  await main()
} catch (error) {
  failures += 1
  console.log('\n验证脚本异常：' + (error && error.stack ? error.stack : String(error)))
} finally {
  rmSync(root, { recursive: true, force: true })
}

console.log('\n' + (failures === 0 ? 'PASS' : 'FAIL') + '  ' + (checks - failures) + '/' + checks + ' 项通过')
process.exit(failures === 0 ? 0 : 1)
