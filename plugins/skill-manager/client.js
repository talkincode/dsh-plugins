const h = React.createElement

const CSS = `
.skm-root{display:flex;flex-direction:column;gap:10px;height:min(74vh,760px);min-height:420px;color:var(--dsw-alias-label-primary);font-size:13px;}
.skm-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;flex:none;}
.skm-title{font-size:16px;font-weight:650;}
.skm-sub{margin-top:3px;font-size:11.5px;color:var(--dsw-alias-label-secondary);}
.skm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.skm-input{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 10px;color:var(--dsw-alias-label-primary);font-size:12.5px;font-family:inherit;outline:none;box-sizing:border-box;}
.skm-input:focus{border-color:var(--dsw-alias-brand-primary);}
.skm-input[readonly]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);}
.skm-search{width:210px;}
.skm-select{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 8px;color:var(--dsw-alias-label-primary);font-size:12.5px;font-family:inherit;outline:none;}
.skm-btn{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 12px;color:var(--dsw-alias-label-primary);font-size:12.5px;font-family:inherit;cursor:pointer;white-space:nowrap;}
.skm-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2);}
.skm-btn:disabled{opacity:.45;cursor:not-allowed;}
.skm-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff;}
.skm-btn-danger{color:var(--dsw-alias-state-error-primary);}
.skm-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;}
.skm-seg>button{background:transparent;border:0;border-right:1px solid var(--dsw-alias-border-l1);padding:6px 12px;font-size:12.5px;font-family:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.skm-seg>button:last-child{border-right:0;}
.skm-seg>button.is-on{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:600;}
.skm-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(190px,260px) minmax(0,1fr);gap:12px;}
.skm-list{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);overflow:auto;padding:6px;min-height:0;}
.skm-group{position:sticky;top:-6px;z-index:1;background:var(--dsw-alias-bg-layer-1);padding:8px 8px 5px;font-size:10.5px;letter-spacing:.06em;color:var(--dsw-alias-label-secondary);display:flex;justify-content:space-between;border-bottom:1px solid var(--dsw-alias-border-l1);margin-bottom:4px;}
.skm-item{display:block;width:100%;text-align:left;border:1px solid transparent;border-radius:8px;background:transparent;padding:7px 9px;cursor:pointer;color:inherit;font:inherit;margin-bottom:2px;}
.skm-item:hover{background:var(--dsw-alias-bg-layer-2);}
.skm-item.is-active{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary);}
.skm-item-top{display:flex;align-items:center;justify-content:space-between;gap:6px;}
.skm-item-name{font-weight:600;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.skm-badge{flex:none;font-size:10px;line-height:16px;padding:0 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}
.skm-badge.is-ok{color:var(--dsw-alias-state-success-primary);border-color:currentColor;}
.skm-badge.is-ro{color:var(--dsw-alias-state-warn-primary);border-color:currentColor;}
.skm-item-desc{margin-top:3px;font-size:11px;line-height:1.45;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.skm-editor{display:flex;flex-direction:column;gap:10px;min-height:0;min-width:0;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:10px;overflow:hidden;}
.skm-empty{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12.5px;padding:24px 12px;}
.skm-file{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;color:var(--dsw-alias-label-secondary);word-break:break-all;}
.skm-meta{display:flex;gap:8px;flex-wrap:wrap;flex:none;}
.skm-field{display:flex;flex-direction:column;gap:4px;min-width:0;}
.skm-field-grow{flex:1;min-width:180px;}
.skm-label{font-size:10.5px;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);}
.skm-bar{display:flex;align-items:center;gap:8px;flex:none;flex-wrap:wrap;}
.skm-pane{flex:1;min-height:0;display:flex;flex-direction:column;}
.skm-ta{flex:1;min-height:0;width:100%;box-sizing:border-box;resize:none;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.65;outline:none;}
.skm-ta:focus{border-color:var(--dsw-alias-brand-primary);}
.skm-ta:disabled{opacity:.78;}
.skm-read{flex:1;min-height:0;overflow:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);padding:12px 16px;line-height:1.7;}
.skm-h{font-weight:650;margin:14px 0 6px;}
.skm-h1{font-size:17px;}
.skm-h2{font-size:15px;}
.skm-h3{font-size:13.5px;}
.skm-h4,.skm-h5,.skm-h6{font-size:12.5px;}
.skm-p{margin:7px 0;}
.skm-ul{margin:7px 0;padding-left:20px;}
.skm-ul>li{margin:3px 0;}
.skm-quote{margin:8px 0;padding:2px 12px;border-left:3px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);}
.skm-pre{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.6;margin:8px 0;}
.skm-code{background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;}
.skm-foot{display:flex;align-items:center;gap:8px;flex:none;flex-wrap:wrap;border-top:1px solid var(--dsw-alias-border-l1);padding-top:10px;}
.skm-note{font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
.skm-note.is-ok{color:var(--dsw-alias-state-success-primary);}
.skm-note.is-error{color:var(--dsw-alias-state-error-primary);}
.skm-dirty{font-size:11.5px;color:var(--dsw-alias-state-warn-primary);}
.skm-spacer{flex:1;}
.skm-form{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:10px;background:var(--dsw-alias-bg-layer-1);flex:none;}
.skm-grow{flex:1;min-width:140px;}
.skm-hint{font-size:11.5px;line-height:1.5;color:var(--dsw-alias-state-warn-primary);}
.skm-run{font-size:12.5px;line-height:1.6;color:var(--dsw-alias-label-primary);}
@media (max-width:700px){.skm-body{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(120px,30%) minmax(0,1fr);}}
`

function sourceGroup(source) {
  if (source === 'project-agents' || source === 'project-dsh') return 'project'
  if (source === 'bundled') return 'bundled'
  if (source === 'custom') return 'custom'
  return 'user'
}

function groupLabel(group) {
  if (group === 'project') return '项目技能'
  if (group === 'bundled') return '内置技能（只读）'
  if (group === 'custom') return '自定义目录'
  return '用户技能'
}

function sourceLabel(source) {
  if (source === 'project-agents' || source === 'project-dsh') return '项目'
  if (source === 'bundled') return '内置'
  if (source === 'custom') return '自定义'
  if (source === 'user-dsh') return '用户'
  if (source === 'user-agents') return '用户'
  return '技能'
}

function timestamp() {
  const now = new Date()
  const pad = function (value) { return value < 10 ? '0' + value : String(value) }
  return pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())
}

function unquoteScalar(raw) {
  let text = String(raw === undefined || raw === null ? '' : raw).trim()
  if (text.length >= 2) {
    const quote = text.charAt(0)
    if ((quote === '"' || quote === "'") && text.charAt(text.length - 1) === quote) {
      text = text.slice(1, -1)
      if (quote === '"') text = text.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }
  }
  return text
}

function parseDoc(text) {
  const value = typeof text === 'string' ? text : ''
  const lines = value.split('\n')
  const empty = { front: false, frontLines: [], body: value, name: '', description: '', nameIndex: -1, descriptionIndex: -1 }
  if (lines.length < 3 || lines[0].trim() !== '---') return empty
  let end = -1
  for (let i = 1; i < lines.length; i++) if (lines[i].trim() === '---') { end = i; break }
  if (end < 0) return empty
  const frontLines = lines.slice(1, end)
  const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '')
  let name = ''
  let description = ''
  let nameIndex = -1
  let descriptionIndex = -1
  for (let i = 0; i < frontLines.length; i++) {
    const match = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(frontLines[i])
    if (match === null) continue
    const key = match[1].toLowerCase()
    const scalar = unquoteScalar(match[2])
    if (key === 'name' && nameIndex < 0) { name = scalar; nameIndex = i }
    else if (key === 'description' && descriptionIndex < 0) { description = scalar; descriptionIndex = i }
  }
  return { front: true, frontLines: frontLines, body: body, name: name, description: description, nameIndex: nameIndex, descriptionIndex: descriptionIndex }
}

function scalarLine(value) {
  const text = String(value === undefined || value === null ? '' : value)
  if (text === '') return '""'
  if (/[:#\[\]{}*&!|>'"%@`,\\]/.test(text) || /^\s|\s$/.test(text)) {
    return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  }
  return text
}

function composeDoc(doc, changes) {
  const body = changes.body === undefined ? doc.body : changes.body
  if (doc.front !== true) return body
  const lines = doc.frontLines.slice()
  if (changes.description !== undefined) {
    const line = 'description: ' + scalarLine(changes.description)
    if (doc.descriptionIndex >= 0) lines[doc.descriptionIndex] = line
    else if (doc.nameIndex >= 0) lines.splice(doc.nameIndex + 1, 0, line)
    else lines.unshift(line)
  }
  if (changes.name !== undefined) {
    const line = 'name: ' + scalarLine(changes.name)
    if (doc.nameIndex >= 0) lines[doc.nameIndex] = line
    else lines.unshift(line)
  }
  return '---\n' + lines.join('\n') + '\n---\n\n' + body
}

function renderInline(text, keyPrefix) {
  const nodes = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let index = 0
  let match = pattern.exec(text)
  while (match !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const token = match[0]
    if (token.charAt(0) === '`') nodes.push(h('code', { key: keyPrefix + 'c' + index, className: 'skm-code' }, token.slice(1, -1)))
    else nodes.push(h('strong', { key: keyPrefix + 's' + index }, token.slice(2, -2)))
    last = match.index + token.length
    index = index + 1
    match = pattern.exec(text)
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function renderMarkdown(text) {
  const lines = String(text === undefined || text === null ? '' : text).split('\n')
  const blocks = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i = i + 1; continue }
    if (line.trim().indexOf('```') === 0) {
      const code = []
      i = i + 1
      while (i < lines.length && lines[i].trim().indexOf('```') !== 0) { code.push(lines[i]); i = i + 1 }
      i = i + 1
      blocks.push(h('pre', { key: 'b' + key, className: 'skm-pre' }, code.join('\n')))
      key = key + 1
      continue
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading !== null) {
      const level = heading[1].length
      blocks.push(h('div', { key: 'b' + key, className: 'skm-h skm-h' + level }, renderInline(heading[2], 'h' + key)))
      key = key + 1
      i = i + 1
      continue
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(h('li', { key: 'i' + i }, renderInline(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''), 'l' + i)))
        i = i + 1
      }
      blocks.push(h('ul', { key: 'b' + key, className: 'skm-ul' }, items))
      key = key + 1
      continue
    }
    if (/^\s*>/.test(line)) {
      const quoted = []
      while (i < lines.length && /^\s*>/.test(lines[i])) { quoted.push(lines[i].replace(/^\s*>\s?/, '')); i = i + 1 }
      blocks.push(h('blockquote', { key: 'b' + key, className: 'skm-quote' }, renderInline(quoted.join(' '), 'q' + key)))
      key = key + 1
      continue
    }
    const paragraph = [line]
    i = i + 1
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|```|\s*([-*+]|\d+\.)\s|\s*>)/.test(lines[i])) {
      paragraph.push(lines[i])
      i = i + 1
    }
    blocks.push(h('p', { key: 'b' + key, className: 'skm-p' }, renderInline(paragraph.join(' '), 'p' + key)))
    key = key + 1
  }
  if (blocks.length === 0) return [h('div', { key: 'none', className: 'skm-note' }, '（正文为空）')]
  return blocks
}

function SkillManager() {
  const [model, setModel] = React.useState({ phase: 'loading', error: '', home: '', skills: [], targets: [] })
  const [query, setQuery] = React.useState('')
  const [scope, setScope] = React.useState('all')
  const [sel, setSel] = React.useState(null)
  const [raw, setRaw] = React.useState('')
  const [original, setOriginal] = React.useState('')
  const [mode, setMode] = React.useState('form')
  const [busy, setBusy] = React.useState(false)
  const [loadingFile, setLoadingFile] = React.useState(false)
  const [note, setNote] = React.useState(null)
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [newDesc, setNewDesc] = React.useState('')
  const [newRoot, setNewRoot] = React.useState('')
  const [confirming, setConfirming] = React.useState(false)
  const [cursor, setCursor] = React.useState(-1)

  const tokenRef = React.useRef(0)
  const itemRefs = React.useRef({})

  function applyModel(result, keepFile) {
    const skills = result.skills || []
    const targets = result.targets || []
    setModel({ phase: 'ready', error: '', home: result.home || '', cwd: result.cwd || '', skills: skills, targets: targets })
    setNewRoot(function (previous) { return previous !== '' ? previous : (targets[0] ? targets[0].path : '') })
    if (keepFile !== undefined && keepFile !== null) {
      for (let i = 0; i < skills.length; i++) if (skills[i].file === keepFile) { setSel(skills[i]); break }
    }
  }

  async function reload(keepFile) {
    try {
      const result = await host.call('bootstrap', {})
      if (!result || result.ok !== true) throw new Error((result && result.error) || '加载技能清单失败')
      applyModel(result, keepFile)
    } catch (error) {
      setModel(function (previous) { return { phase: 'error', error: String((error && error.message) || error), home: previous.home, cwd: previous.cwd, skills: previous.skills, targets: previous.targets } })
    }
  }

  React.useEffect(function () { void reload(null) }, [])

  React.useEffect(function () {
    if (sel === null) return
    const node = itemRefs.current[sel.file]
    if (node && typeof node.scrollIntoView === 'function') node.scrollIntoView({ block: 'nearest' })
  }, [sel])

  async function open(skill) {
    const token = tokenRef.current + 1
    tokenRef.current = token
    setSel(skill)
    setConfirming(false)
    setNote(null)
    setRaw('')
    setOriginal('')
    setLoadingFile(true)
    try {
      const result = await host.call('read', { file: skill.file })
      if (tokenRef.current !== token) return
      if (!result || result.ok !== true) throw new Error((result && result.error) || '读取失败')
      const content = result.content || ''
      setRaw(content)
      setOriginal(content)
      setMode('form')
    } catch (error) {
      if (tokenRef.current !== token) return
      setNote({ kind: 'error', text: String((error && error.message) || error) })
    } finally {
      if (tokenRef.current === token) setLoadingFile(false)
    }
  }

  async function save() {
    if (sel === null || sel.editable !== true || busy === true) return
    if (raw === original) { setNote({ kind: 'ok', text: '没有需要保存的改动' }); return }
    const file = sel.file
    setBusy(true)
    setNote(null)
    try {
      const result = await host.call('save', { file: file, content: raw, description: parseDoc(raw).description })
      if (!result || result.ok !== true) throw new Error((result && result.error) || '保存失败')
      setOriginal(raw)
      setNote({ kind: 'ok', text: '已保存 · ' + timestamp() + ' · ' + raw.length + ' 字符' })
      await reload(file)
    } catch (error) {
      setNote({ kind: 'error', text: String((error && error.message) || error) })
    } finally {
      setBusy(false)
    }
  }

  async function create() {
    if (busy === true) return
    const name = newName.trim()
    if (name === '') return
    const description = newDesc.trim()
    setBusy(true)
    setNote(null)
    try {
      const result = await host.call('create', { name: name, description: description, root: newRoot })
      if (!result || result.ok !== true) throw new Error((result && result.error) || '创建失败')
      setCreating(false)
      setNewName('')
      setNewDesc('')
      await reload(null)
      await open({ file: result.file, dir: result.dir, name: result.name, description: description, source: 'user-agents', kind: 'dir', editable: true })
      setNote({ kind: 'ok', text: '已创建 ' + result.file })
    } catch (error) {
      setNote({ kind: 'error', text: String((error && error.message) || error) })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (sel === null || busy === true) return
    const target = sel
    setBusy(true)
    setNote(null)
    try {
      const result = await host.call('delete', { file: target.file })
      if (!result || result.ok !== true) throw new Error((result && result.error) || '删除失败')
      tokenRef.current = tokenRef.current + 1
      setConfirming(false)
      setSel(null)
      setRaw('')
      setOriginal('')
      setCursor(-1)
      await reload(null)
      setNote({ kind: 'ok', text: '已删除 ' + target.file })
    } catch (error) {
      setNote({ kind: 'error', text: String((error && error.message) || error) })
    } finally {
      setBusy(false)
    }
  }

  const doc = parseDoc(raw)
  const readonly = sel === null || sel.editable !== true
  const dirty = sel !== null && raw !== original
  const keyword = query.trim().toLowerCase()
  const filtered = model.skills.filter(function (skill) {
    if (scope === 'writable' && skill.editable !== true) return false
    if (scope === 'readonly' && skill.editable === true) return false
    if (keyword === '') return true
    return (skill.name + ' ' + (skill.description || '')).toLowerCase().indexOf(keyword) >= 0
  })

  const groupOrder = ['user', 'project', 'bundled', 'custom']
  const groups = []
  const flat = []
  for (let g = 0; g < groupOrder.length; g++) {
    const groupKey = groupOrder[g]
    const items = filtered.filter(function (skill) { return sourceGroup(skill.source) === groupKey })
    if (items.length === 0) continue
    groups.push({ key: groupKey, label: groupLabel(groupKey), items: items })
    for (let i = 0; i < items.length; i++) flat.push(items[i])
  }
  const indexOfFile = {}
  for (let i = 0; i < flat.length; i++) indexOfFile[flat[i].file] = i
  const editableCount = model.skills.filter(function (skill) { return skill.editable === true }).length

  function moveCursor(delta) {
    if (flat.length === 0) return
    let next = cursor
    if (next < 0) next = delta > 0 ? 0 : flat.length - 1
    else next = (next + delta + flat.length) % flat.length
    setCursor(next)
    void open(flat[next])
  }

  function onSearchKeyDown(event) {
    if (event.key === 'ArrowDown') { event.preventDefault(); moveCursor(1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveCursor(-1) }
    else if (event.key === 'Enter' && flat.length > 0) { event.preventDefault(); void open(flat[cursor >= 0 && cursor < flat.length ? cursor : 0]) }
  }

  function onRootKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && (event.key === 's' || event.key === 'S')) { event.preventDefault(); void save() }
    else if (event.key === 'Escape' && confirming === true) { setConfirming(false) }
  }

  const header = h('div', { className: 'skm-head' },
    h('div', null,
      h('div', { className: 'skm-title' }, '技能管理'),
      h('div', { className: 'skm-sub' }, model.phase === 'loading'
        ? '正在读取技能目录…'
        : (model.skills.length + ' 个技能 · 可编辑 ' + editableCount + ' 个 · 当前显示 ' + flat.length + ' 个' + (model.home !== '' ? ' · ' + model.home + '/.agents/skills' : '')))
    ),
    h('div', { className: 'skm-actions' },
      h('input', { className: 'skm-input skm-search', placeholder: '搜索名称或描述（↓↑ 切换）', value: query, onChange: function (event) { setQuery(event.target.value); setCursor(-1) }, onKeyDown: onSearchKeyDown }),
      h('select', { className: 'skm-select', value: scope, onChange: function (event) { setScope(event.target.value); setCursor(-1) } },
        h('option', { value: 'all' }, '全部'),
        h('option', { value: 'writable' }, '仅可编辑'),
        h('option', { value: 'readonly' }, '仅只读')
      ),
      h('button', { className: 'skm-btn', disabled: busy === true, onClick: function () { void reload(sel === null ? null : sel.file) } }, '刷新'),
      h('button', { className: 'skm-btn skm-btn-primary', onClick: function () { setCreating(!creating); setConfirming(false); setNote(null) } }, creating ? '取消新建' : '＋ 新建技能')
    )
  )

  const form = creating ? h('div', { className: 'skm-form' },
    h('input', { className: 'skm-input skm-grow', placeholder: '技能名：小写 kebab-case，如 my-skill', value: newName, onChange: function (event) { setNewName(event.target.value) } }),
    h('input', { className: 'skm-input skm-grow', placeholder: '一句话描述（写入 frontmatter description）', value: newDesc, onChange: function (event) { setNewDesc(event.target.value) } }),
    h('select', { className: 'skm-select', value: newRoot, onChange: function (event) { setNewRoot(event.target.value) } },
      model.targets.map(function (target) { return h('option', { key: target.path, value: target.path }, target.label) })
    ),
    h('button', { className: 'skm-btn skm-btn-primary', disabled: busy === true || newName.trim() === '', onClick: create }, busy === true ? '创建中…' : '创建')
  ) : null

  const noteLine = h('div', { className: 'skm-note' + (note === null ? '' : note.kind === 'ok' ? ' is-ok' : note.kind === 'error' ? ' is-error' : '') + ' skm-bar' }, note === null ? '' : note.text)

  let itemIndex = -1
  const listPane = h('div', { className: 'skm-list' },
    flat.length === 0
      ? h('div', { className: 'skm-empty' }, keyword !== '' || scope !== 'all' ? '没有匹配的技能' : '暂无技能')
      : groups.map(function (group) {
          return h('div', { key: group.key },
            h('div', { className: 'skm-group' },
              h('span', null, group.label),
              h('span', null, String(group.items.length))
            ),
            group.items.map(function (skill) {
              itemIndex = itemIndex + 1
              const isActive = sel !== null && sel.file === skill.file
              const isCursor = cursor === itemIndex && isActive !== true
              return h('button', {
                key: skill.file,
                ref: function (node) { if (node === null) delete itemRefs.current[skill.file]; else itemRefs.current[skill.file] = node },
                className: 'skm-item' + (isActive === true || isCursor === true ? ' is-active' : ''),
                onClick: function () { setCursor(indexOfFile[skill.file]); void open(skill) },
              },
                h('div', { className: 'skm-item-top' },
                  h('span', { className: 'skm-item-name', title: skill.name }, skill.name),
                  h('span', { className: 'skm-badge' + (skill.editable === true ? ' is-ok' : ' is-ro') }, skill.editable === true ? sourceLabel(skill.source) : '只读')
                ),
                h('div', { className: 'skm-item-desc' }, skill.description || '（无描述）')
              )
            })
          )
        })
  )

  let editorBody
  if (sel === null) {
    editorBody = h('div', { className: 'skm-empty' }, '从左侧选择一个技能：↓↑ 快速切换，⌘/Ctrl + S 保存')
  } else if (loadingFile === true) {
    editorBody = h('div', { className: 'skm-empty' }, '读取中…')
  } else if (mode === 'preview') {
    editorBody = h('div', { className: 'skm-read' }, renderMarkdown(doc.body))
  } else if (mode === 'source') {
    editorBody = h('textarea', {
      className: 'skm-ta',
      value: raw,
      spellCheck: false,
      disabled: readonly === true || busy === true,
      onChange: function (event) { setRaw(event.target.value) },
    })
  } else {
    editorBody = h('textarea', {
      className: 'skm-ta',
      value: doc.body,
      spellCheck: false,
      disabled: readonly === true || busy === true,
      onChange: function (event) {
        const next = event.target.value
        setRaw(function (current) { return composeDoc(parseDoc(current), { body: next }) })
      },
    })
  }

  const editor = h('div', { className: 'skm-editor' },
    sel === null ? editorBody : [
      h('div', { className: 'skm-item-top', key: 'head' },
        h('span', { style: { fontWeight: 600, fontSize: '13.5px' } }, sel.name),
        h('span', { className: 'skm-badge' + (sel.editable === true ? ' is-ok' : ' is-ro') }, (sel.editable === true ? '可编辑 · ' : '只读 · ') + sourceLabel(sel.source))
      ),
      h('div', { className: 'skm-file', key: 'path' }, sel.file),
      sel.editable === true ? null : h('div', { className: 'skm-hint', key: 'hint' }, '只读技能（内置或第三方目录）：可以浏览和预览，不能在此保存或删除。'),
      loadingFile === true || mode !== 'form' || doc.front !== true ? null : h('div', { className: 'skm-meta', key: 'meta' },
        h('label', { className: 'skm-field' },
          h('span', { className: 'skm-label' }, 'name'),
          h('input', { className: 'skm-input', style: { width: '170px' }, value: doc.name, readOnly: true, tabIndex: -1 })
        ),
        h('label', { className: 'skm-field skm-field-grow' },
          h('span', { className: 'skm-label' }, 'description（frontmatter）'),
          h('input', {
            className: 'skm-input',
            value: doc.description,
            placeholder: '一句话说明这个技能做什么、何时使用',
            disabled: readonly === true || busy === true,
            onChange: function (event) {
              const next = event.target.value
              setRaw(function (current) { return composeDoc(parseDoc(current), { description: next }) })
            },
          })
        )
      ),
      loadingFile === true ? null : h('div', { className: 'skm-bar', key: 'bar' },
        h('div', { className: 'skm-seg' },
          h('button', { className: mode === 'form' ? 'is-on' : '', onClick: function () { setMode('form') } }, doc.front === true ? '表单' : '正文'),
          h('button', { className: mode === 'preview' ? 'is-on' : '', onClick: function () { setMode('preview') } }, '预览'),
          h('button', { className: mode === 'source' ? 'is-on' : '', onClick: function () { setMode('source') } }, '源码')
        ),
        h('span', { className: 'skm-note' }, mode === 'source' ? '编辑完整文件（含 frontmatter）' : mode === 'preview' ? '只读渲染，不执行任何内容' : (doc.front === true ? '正文（Markdown 源码）' : '该文件没有 frontmatter，保存时也不会添加')),
        h('span', { className: 'skm-spacer' }),
        h('span', { className: 'skm-dirty' }, dirty === true ? '● 未保存' : '')
      ),
      loadingFile === true ? h('div', { className: 'skm-empty', key: 'loading' }, '读取中…') : h('div', { className: 'skm-pane', key: 'body' }, editorBody),
      h('div', { className: 'skm-foot', key: 'foot' },
        h('button', { className: 'skm-btn skm-btn-primary', disabled: dirty !== true || readonly === true || busy === true, onClick: save }, busy === true ? '处理中…' : '保存'),
        h('button', { className: 'skm-btn', disabled: dirty !== true || busy === true, onClick: function () { setRaw(original) } }, '撤销改动'),
        h('span', { className: 'skm-spacer' }),
        confirming
          ? [
              h('span', { className: 'skm-note is-error', key: 'ask' }, '确认删除？'),
              h('button', { className: 'skm-btn skm-btn-danger', key: 'yes', disabled: busy === true, onClick: remove }, '确认删除'),
              h('button', { className: 'skm-btn', key: 'no', onClick: function () { setConfirming(false) } }, '取消'),
            ]
          : h('button', { className: 'skm-btn skm-btn-danger', disabled: readonly === true || busy === true, onClick: function () { setConfirming(true) } }, '删除')
      )
    ]
  )

  return h('div', { className: 'skm-root', onKeyDown: onRootKeyDown },
    header,
    form,
    noteLine,
    model.phase === 'error'
      ? h('div', { className: 'skm-empty' }, '加载失败：' + model.error)
      : h('div', { className: 'skm-body' }, listPane, editor)
  )
}

return {
  apply(ctx) {
    if (typeof styles !== 'undefined' && styles !== null && typeof styles.insert === 'function') {
      ctx.effect(function () { return styles.insert(CSS) })
    }
    const slots = ctx.get('slots')
    if (slots === undefined) return
    slots.inject('settings.section', function () {
      return slots.register({ name: 'settings.section', id: 'skill-manager', order: 30, label: '技能管理' }, SkillManager)
    })
    slots.inject('tool.view.cordis', function () {
      return slots.register({ name: 'tool.view.cordis', key: 'self' }, function () {
        return h('div', { className: 'skm-run' }, '技能管理已挂到「设置 → 技能管理」：左侧分组列表（↓↑ 切换），右侧表单 / 预览 / 源码三态，底部常驻保存。')
      })
    })
  },
}
