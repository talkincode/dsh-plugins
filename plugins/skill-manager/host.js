return {
  apply(ctx) {
    const fs = ctx.get('fs')
    const shell = ctx.get('shell')
    const skills = ctx.get('skills')

    const state = { env: null, allowed: {}, targets: [], overrides: {} }

    function fail(message) { return { ok: false, error: String(message) } }
    function quote(value) { return "'" + String(value).replace(/'/g, "'\\''") + "'" }

    async function envPaths() {
      if (state.env !== null) return state.env
      let home = ''
      let cwd = ''
      if (shell !== undefined) {
        try {
          const spec = shell.resolve({ command: 'printf "%s\\n%s" "$HOME" "$PWD"' })
          const result = await shell.run(spec)
          const text = result && result.stdout && typeof result.stdout.text === 'string' ? result.stdout.text : ''
          const lines = text.split('\n')
          home = String(lines[0] || '').trim()
          cwd = String(lines[1] || '').trim()
        } catch (error) {
          console.error('[skill-manager] env probe failed: ' + String(error))
        }
      }
      if (cwd === '' && fs !== undefined) {
        try {
          const target = await fs.resolve('.')
          cwd = fs.processPath(target)
        } catch (error) {
          console.error('[skill-manager] cwd probe failed: ' + String(error))
        }
      }
      state.env = { home: home, cwd: cwd }
      return state.env
    }

    function frontmatterValue(text, key) {
      const lines = String(text).split('\n')
      let inFrontmatter = false
      let markers = 0
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.trim() === '---') {
          markers = markers + 1
          if (markers === 1) { inFrontmatter = true; continue }
          if (markers === 2) break
        }
        if (inFrontmatter !== true) continue
        const match = /^([A-Za-z0-9_.-]+):[ \t]*(.*)$/.exec(line)
        if (match !== null && match[1] === key) return match[2].replace(/^["']+|["']+$/g, '').trim()
      }
      return ''
    }

    function isEditableRoot(segments, skillsIndex) {
      const wrap = segments[skillsIndex - 1]
      return wrap === '.agents' || wrap === '.dsh'
    }

    function classify(file) {
      if (typeof file !== 'string' || file.length === 0 || file.length > 2048) return undefined
      if (file.charAt(0) !== '/') return undefined
      const segments = file.split('/')
      for (let i = 0; i < segments.length; i++) {
        if (segments[i] === '..' || segments[i] === '.') return undefined
      }
      const n = segments.length
      const base = segments[n - 1]
      if (base === 'SKILL.md' && n >= 5) {
        const dirName = segments[n - 2]
        const editable = segments[n - 3] === 'skills' && isEditableRoot(segments, n - 3) && dirName.charAt(0) !== '.'
        return { editable: editable, kind: 'dir', dir: segments.slice(0, n - 1).join('/') }
      }
      if (/\.md$/.test(base) && n >= 4) {
        const editable = segments[n - 2] === 'skills' && isEditableRoot(segments, n - 2)
        return { editable: editable, kind: 'file', dir: segments.slice(0, n - 1).join('/') }
      }
      return { editable: false, kind: 'other', dir: segments.slice(0, n - 1).join('/') }
    }

    async function collectRaw(env) {
      const items = []
      const seen = {}
      if (skills !== undefined) {
        try {
          const list = await skills.list(env.cwd !== '' ? { cwd: env.cwd } : {})
          for (let i = 0; i < list.length; i++) {
            const summary = list[i]
            let dir = ''
            const resourceBase = summary.resourceBase
            if (resourceBase !== undefined && resourceBase !== null && resourceBase.kind === 'directory' && typeof resourceBase.path === 'string') dir = resourceBase.path
            let file = typeof summary.path === 'string' && summary.path !== '' ? summary.path : ''
            if (file === '' && dir !== '') file = dir + '/SKILL.md'
            if (file === '') continue
            if (seen[file] === true) continue
            seen[file] = true
            items.push({
              name: typeof summary.name === 'string' ? summary.name : '',
              description: typeof summary.description === 'string' ? summary.description : '',
              source: typeof summary.source === 'string' ? summary.source : '',
              provider: typeof summary.provider === 'string' ? summary.provider : '',
              file: file,
              dir: dir,
            })
          }
        } catch (error) {
          console.error('[skill-manager] skills.list failed: ' + String(error))
        }
      }
      if (items.length === 0 && fs !== undefined) {
        const roots = []
        if (env.home !== '') {
          roots.push({ path: env.home + '/.agents/skills', source: 'user-agents' })
          roots.push({ path: env.home + '/.dsh/skills', source: 'user-dsh' })
        }
        if (env.cwd !== '') roots.push({ path: env.cwd + '/.agents/skills', source: 'project-agents' })
        for (let r = 0; r < roots.length; r++) {
          const root = roots[r]
          let target
          try { target = await fs.resolve(root.path) } catch (error) { continue }
          let info
          try { info = await fs.stat(target) } catch (error) { continue }
          if (info === undefined || info.type !== 'directory') continue
          let entries = []
          try { entries = await fs.listDir(target) } catch (error) { continue }
          for (let e = 0; e < entries.length; e++) {
            const entry = entries[e]
            if (entry.type === 'directory') {
              if (entry.name.charAt(0) === '.') continue
              const file = entry.target.displayPath + '/SKILL.md'
              let body
              try { body = await fs.readText(await fs.resolve(file)) } catch (error) { continue }
              if (seen[file] === true) continue
              seen[file] = true
              items.push({ name: entry.name, description: frontmatterValue(body, 'description'), source: root.source, provider: 'filesystem', file: file, dir: entry.target.displayPath })
            } else if (entry.type === 'file' && /\.md$/.test(entry.name)) {
              const file = entry.target.displayPath
              let body
              try { body = await fs.readText(entry.target) } catch (error) { continue }
              if (seen[file] === true) continue
              seen[file] = true
              items.push({ name: entry.name.replace(/\.md$/, ''), description: frontmatterValue(body, 'description'), source: root.source, provider: 'filesystem', file: file, dir: root.path })
            }
          }
        }
      }
      return items
    }

    function inferHome(items) {
      for (let i = 0; i < items.length; i++) {
        const file = items[i].file
        const agents = /^(.*)\/\.agents\/skills\//.exec(file)
        if (agents !== null && agents[1] !== '') return agents[1]
        const dsh = /^(.*)\/\.dsh\/skills\//.exec(file)
        if (dsh !== null && dsh[1] !== '') return dsh[1]
      }
      return ''
    }

    async function creationTargets() {
      const env = await envPaths()
      const out = []
      if (env.home !== '') {
        out.push({ path: env.home + '/.agents/skills', label: '用户 · ~/.agents/skills' })
        out.push({ path: env.home + '/.dsh/skills', label: '用户 · ~/.dsh/skills' })
      }
      if (env.cwd !== '') out.push({ path: env.cwd + '/.agents/skills', label: '项目 · <工作区>/.agents/skills' })
      return out
    }

    async function writeSkillFile(file, body) {
      if (fs !== undefined) {
        try {
          const outcome = await fs.writeText(await fs.resolve(file), body)
          return outcome && outcome.operation ? String(outcome.operation) : 'update'
        } catch (error) {
          console.error('[skill-manager] fs write failed, falling back to shell: ' + String(error))
        }
      }
      if (shell === undefined) throw new Error('文件服务与命令服务均不可用')
      const marker = 'DSH_SKILL_MANAGER_EOF'
      const command = 'cat > ' + quote(file) + ' <<\'' + marker + '\'\n' + body + '\n' + marker
      const result = await shell.run(shell.resolve({ command: command }))
      if (result && result.exitCode !== 0) {
        const stderr = result.stderr && typeof result.stderr.text === 'string' ? result.stderr.text : ''
        throw new Error('写入失败：' + stderr.slice(0, 200))
      }
      return 'update'
    }

    harness.handle('bootstrap', async () => {
      try {
        const env = await envPaths()
        const raw = await collectRaw(env)
        if (env.home === '') {
          const guessed = inferHome(raw)
          if (guessed !== '') { env.home = guessed; state.env = env }
        }
        const allowed = {}
        const list = []
        const seen = {}
        for (let i = 0; i < raw.length; i++) {
          const item = raw[i]
          const shape = classify(item.file)
          if (shape === undefined || shape.kind === 'other') continue
          if (seen[item.file] === true) continue
          seen[item.file] = true
          const dir = item.dir !== '' ? item.dir : shape.dir
          allowed[item.file] = { editable: shape.editable, kind: shape.kind, dir: dir, name: item.name }
          list.push({
            name: item.name,
            description: item.description,
            source: item.source,
            provider: item.provider,
            file: item.file,
            dir: dir,
            editable: shape.editable,
            kind: shape.kind,
          })
        }
        const overrideFiles = Object.keys(state.overrides)
        for (let i = 0; i < overrideFiles.length; i++) {
          const file = overrideFiles[i]
          const override = state.overrides[file]
          let found = -1
          for (let j = 0; j < list.length; j++) if (list[j].file === file) { found = j; break }
          if (found >= 0) {
            if (list[found].description === override.description) delete state.overrides[file]
            else list[found].description = override.description
            continue
          }
          const shape = classify(file)
          if (shape === undefined || shape.kind === 'other' || shape.editable !== true) { delete state.overrides[file]; continue }
          allowed[file] = { editable: true, kind: shape.kind, dir: shape.dir, name: override.name }
          seen[file] = true
          list.push({
            name: override.name,
            description: override.description,
            source: 'user-agents',
            provider: 'skill-manager',
            file: file,
            dir: shape.dir,
            editable: true,
            kind: shape.kind,
          })
        }
        list.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0 })
        state.allowed = allowed
        state.targets = await creationTargets()
        return { ok: true, home: env.home, cwd: env.cwd, skills: list, targets: state.targets }
      } catch (error) {
        return fail((error && error.message) || error)
      }
    })

    harness.handle('read', async (args) => {
      try {
        const file = args && typeof args.file === 'string' ? args.file : ''
        const entry = state.allowed[file]
        if (entry === undefined) return fail('该文件不在本次技能清单中，请先刷新')
        if (fs === undefined) return fail('文件服务不可用')
        const target = await fs.resolve(file)
        const content = await fs.readText(target)
        return { ok: true, file: file, content: String(content), editable: entry.editable === true, kind: entry.kind }
      } catch (error) {
        return fail((error && error.message) || error)
      }
    })

    harness.handle('save', async (args) => {
      try {
        const file = args && typeof args.file === 'string' ? args.file : ''
        const content = args && typeof args.content === 'string' ? args.content : ''
        const description = args && typeof args.description === 'string' ? args.description : undefined
        const entry = state.allowed[file]
        if (entry === undefined) return fail('该文件不在本次技能清单中，请先刷新')
        if (entry.editable !== true) return fail('该技能位于只读目录，无法保存')
        if (content.length > 524288) return fail('内容过大（上限 512KB）')
        const operation = await writeSkillFile(file, content)
        if (description !== undefined) state.overrides[file] = { name: entry.name, description: description }
        return { ok: true, file: file, operation: operation, bytes: content.length }
      } catch (error) {
        return fail((error && error.message) || error)
      }
    })

    harness.handle('create', async (args) => {
      try {
        const name = args && typeof args.name === 'string' ? args.name.trim() : ''
        const description = args && typeof args.description === 'string' ? args.description.replace(/\s+/g, ' ').trim() : ''
        const requestedRoot = args && typeof args.root === 'string' ? args.root : ''
        if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) return fail('技能名需为小写 kebab-case（字母、数字、连字符，1-64 位）')
        const targets = await creationTargets()
        let target = null
        for (let i = 0; i < targets.length; i++) if (targets[i].path === requestedRoot) target = targets[i]
        if (target === null) target = targets.length > 0 ? targets[0] : null
        if (target === null) return fail('未找到可写入的技能目录')
        const dir = target.path + '/' + name
        const file = dir + '/SKILL.md'
        if (fs !== undefined) {
          let existing
          try { existing = await fs.stat(await fs.resolve(dir)) } catch (error) { existing = undefined }
          if (existing !== undefined) return fail('同名技能已存在：' + dir)
        }
        if (shell === undefined && fs === undefined) return fail('文件服务不可用')
        if (shell !== undefined) {
          const made = await shell.run(shell.resolve({ command: 'mkdir -p -- ' + quote(dir) }))
          if (made && made.exitCode !== 0) {
            const stderr = made.stderr && typeof made.stderr.text === 'string' ? made.stderr.text : ''
            return fail('创建目录失败：' + stderr.slice(0, 200))
          }
        }
        const summary = description !== '' ? description : '待补充：说明这个技能做什么，以及何时使用。'
        const body = '---\nname: ' + name + '\ndescription: ' + summary + '\n---\n\n# ' + name + '\n\n## 何时使用\n\n- \n\n## 步骤\n\n1. \n'
        const operation = await writeSkillFile(file, body)
        state.allowed[file] = { editable: true, kind: 'dir', dir: dir, name: name }
        state.overrides[file] = { name: name, description: summary }
        return { ok: true, file: file, name: name, dir: dir, operation: operation }
      } catch (error) {
        return fail((error && error.message) || error)
      }
    })

    harness.handle('delete', async (args) => {
      try {
        const file = args && typeof args.file === 'string' ? args.file : ''
        const entry = state.allowed[file]
        if (entry === undefined) return fail('该文件不在本次技能清单中，请先刷新')
        if (entry.editable !== true) return fail('该技能位于只读目录，无法删除')
        if (shell === undefined) return fail('命令服务不可用，无法删除')
        const shape = classify(file)
        if (shape === undefined || shape.editable !== true) return fail('路径校验未通过，拒绝删除')
        const command = shape.kind === 'dir' ? 'rm -rf -- ' + quote(shape.dir) : 'rm -f -- ' + quote(file)
        const result = await shell.run(shell.resolve({ command: command }))
        if (result && result.exitCode !== 0) {
          const stderr = result.stderr && typeof result.stderr.text === 'string' ? result.stderr.text : ''
          return fail('删除失败：' + stderr.slice(0, 200))
        }
        delete state.allowed[file]
        delete state.overrides[file]
        return { ok: true, file: file, removed: shape.kind === 'dir' ? shape.dir : file }
      } catch (error) {
        return fail((error && error.message) || error)
      }
    })
  },
}
