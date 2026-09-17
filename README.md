# dsh-plugins

DSH 插件集：技能（skills）、MCP（Model Context Protocol）定义，以及（预留的）管理 UI。本仓库不发布到 npm 或任何公共包管理器，所有插件通过仓库本身本地登记、本地加载。

## 目录

- [`docs/roadmap.md`](docs/roadmap.md) — 项目画像与方向：目标状态、非目标铁律、验收矩阵。
- [`AGENTS.md`](AGENTS.md) — 开发规约：目录约定、边界、提交规范、脱敏硬规则。
- [`skills/`](skills/) — 技能定义，一技能一目录。
- [`mcp/`](mcp/) — MCP server / 工具的本地登记。

## 质量与验收

新增技能或 MCP 登记项时，必须同步更新 [`docs/roadmap.md`](docs/roadmap.md) 中的验收矩阵，并至少覆盖一条 Happy Path 端到端验证。任何提交、示例、文档都必须脱敏——禁止提交真实密钥、内网地址或客户数据，详见 [`AGENTS.md`](AGENTS.md)。
