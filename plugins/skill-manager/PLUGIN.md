# skill-manager · 技能管理

在 DSH 设置面板里管理本机技能目录：分组列出、查看、编辑并保存 `SKILL.md`，支持新建与删除用户技能。

## 登记信息

| 项 | 值 |
| --- | --- |
| 插件 ID | `skill-manager` |
| 类别 | **其他** —— DSH 客户端插件（动态 Cordis 插件，Host + Client 两半） |
| 名称 | 技能管理 Skill Manager |
| 实现位置 | **本仓内联**（`host.js` + `client.js`），无外部代码库 |
| 加载方式 | 会话内动态 Cordis 装载，见下 |
| 分发 | 按仓库路径本地加载，不发布 npm |
| 运行时依赖 | DSH 提供的 `skills` / `fs` / `shell`；浏览器端 `slots` |

## 它不是本仓库的「Skills 管理面」

`docs/roadmap.md` 里规划的 Skills 管理面，管理对象是**本仓库 `plugins/` 下的登记信息**（浏览、发现、审阅登记项），当前阶段仍在规划、未启动实现。

本插件的管理对象是**运行 DSH 的那台机器上的技能目录**（`~/.agents/skills`、`<workspace>/.agents/skills` 等）。它是本仓库登记的一个插件，不是那个管理面：对象不同、代码不共享，本插件不读取 `plugins/` 下的任何内容。

因此本插件也不构成对管理面的技术选型——它是「被登记的插件」这一侧的实现，管理面将来用什么技术栈、覆盖哪些插件类型，不受它约束。

## 如何被加载

`host.js` 与 `client.js` 是动态 Cordis Package 的**函数体本身**（不是 ESM 模块，没有 import/export），整段交给 `cordis_define`：

```bash
# 校验语法并输出 cordis_define 的入参 JSON
node plugins/skill-manager/build-payload.mjs --compact
```

把输出交给 `cordis_define`（其中 `plugin` 为 `{ "kind": "new", "idPrefix": "skmgr" }`），再 `cordis_run` 激活。Client 半边注册到 `settings.section`，激活后出现在 **设置 → 技能管理**。

生命周期随 DSH 进程：`cordis_stop` 临时停用，`cordis_undefine` 永久移除；两者都会把 UI 与 Host handler 一并撤掉。

## 实现指向哪里

| 文件 | 角色 |
| --- | --- |
| [`host.js`](host.js) | Host 半边：`harness.handle` 暴露 5 个 Package 私有 RPC |
| [`client.js`](client.js) | Client 半边：设置页 UI（`React.createElement`，无 JSX/TS） |
| [`plugin.json`](plugin.json) | 元数据：idPrefix、用到的服务与 Slot、路径策略 |
| [`build-payload.mjs`](build-payload.mjs) | 读两份函数体 → 校验语法 → 输出 `cordis_define` 入参（零依赖） |
| [`verify.mjs`](verify.mjs) | 离线端到端验证，见「验收」 |

**为什么可以内联而不是只放指向**：两份源码都是零依赖纯 JS，无构建步骤、无包管理器参与，各一份且互不引用，改动即生效；符合 `AGENTS.md` 中「只有足够小、天然适合内联维护的插件，才把完整实现放进这个目录」的前提。仓库里没有引入任何构建链路。

## Host / Client 契约

Host 通过 `harness.handle` 暴露 5 个方法，Client 用 `host.call` 调用，只传无损 JSON：

| 方法 | 入参 | 返回 |
| --- | --- | --- |
| `bootstrap` | — | `{ ok, home, cwd, skills[], targets[] }` |
| `read` | `{ file }` | `{ ok, file, content, editable, kind }` |
| `save` | `{ file, content, description? }` | `{ ok, file, operation, bytes }` |
| `create` | `{ name, description, root }` | `{ ok, file, name, dir, operation }` |
| `delete` | `{ file }` | `{ ok, file, removed }` |

Client 侧注册的 Slot：

| Slot | 注册项 | 用途 |
| --- | --- | --- |
| `settings.section` | `id: skill-manager`，`order: 30`，`label: 技能管理` | 完整设置页 |
| `tool.view.cordis` | `key: self` | Run 卡片上的一行入口提示 |

## 安全边界

写和删**只认路径形状**，不信任前端传入的任何路径：

- 允许：`<...>/.agents/skills/<name>/SKILL.md`、`<...>/.dsh/skills/<name>/SKILL.md`，以及同目录下的单文件 `<name>.md`
- 拒绝：任何含 `.` / `..` 段的路径、点开头的技能目录名、非 `.md` 目标
- `read` 只接受 `bootstrap` 当次列入白名单的文件，插件无法读任意路径
- 内置（preset bundled）与 custom 目录下的技能一律**只读**：可浏览与预览，不可保存/删除
- 交给 shell 的路径全部单引号转义；写入内容上限 512KB
- 渲染预览用自己的极简 Markdown 实现，不注入 HTML、不执行任何内容

本插件不涉及凭据、连接信息或秘密值，因此不触发 `AGENTS.md` 中「默认脱敏展示」的适用场景。

## 验收

### 离线端到端（CI 门禁）

```bash
node plugins/skill-manager/verify.mjs
```

用真文件系统 + 真 bash 适配 `fs` / `shell`，用固定假目录当技能根，因此不需要 DSH 进程即可复现完整链路：

- 注册面：5 个 RPC 是否齐备
- Happy Path：`bootstrap` 发现技能 → `read` 读回原文 → `save` 保存描述 → 列表即时反映 → `create` 新建 → 删除
- 失败路径：`read` 未登记路径与越权相对路径、只读技能的 `save` / `delete`、`create` 重名与非法名（含路径穿越）、未登记文件的 `save`
- 回滚：删除后重建同名技能
- 纯函数：`client.js` 的 frontmatter 解析/重组往返（含引号、冒号、井号的描述不得漂移，重复重组结果必须逐字节一致）

实测：`PASS 38/38`。

### 在线验证（人工，非门禁）

同一份源码已在实机 DSH 会话中装载运行：Host 五个 handler 全部注册、Client 无 waiting、无渲染失败诊断；`设置 → 技能管理` 正常列出技能并完成保存、新建、删除。这一步依赖具体机器与本地技能目录，因此只作为人工验收记录，不作为 CI 门禁。

## 已知限制

- **不重启进程**：动态插件活在当前 DSH 进程内，进程结束即消失。要长期存在需要另做一步——包成带 `dsh.client` 字段的 npm 包（客户端需构建产物）并在 host composition 的 `cordis.yml` 加一行；本目录不承担这件事
- **frontmatter 只做行级标量编辑**：块标量（`>-`、`|`）、锚点、多行 description 不做结构化改写，这类文件请用「源码」模式
- **预览能力有限**：不支持表格、图片、链接跳转、HTML 块
- **路径策略面向本机绝对路径**：不处理远程 fs 后端的 `displayPath` 差异
- 保存后列表描述即时更新依赖插件内存中的覆盖表，技能目录缓存失效后自然收敛
