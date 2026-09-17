# dsh-plugins

A small, opinionated starting point for discovering **DeepSeek Harness (DSH)** plugins.

DeepSeek Harness is built around an **everything-is-a-plugin** model, so the fastest way to extend it is usually to install an existing package or study a well-documented community project.

## Start here

These are the upstream resources referenced by the DeepSeek Harness project itself:

- Official DeepSeek Harness repository: <https://github.com/deepseek-ai/deepseek-harness>
- Official documentation: <https://deepseek-harness.github.io/deepseek-harness/>
- Community plugin topic: <https://github.com/topics/dsh-plugin>
- Community discussions: <https://github.com/deepseek-ai/deepseek-harness/discussions>

## Installing a plugin

After you have DSH running, install a plugin into a profile with:

```sh
dsh plugin --profile web add <package>
```

Replace `web` with the profile you want to extend and replace `<package>` with the npm package name you want to install.

## What to look for in a plugin

Prefer plugins that clearly document:

- supported DSH versions
- installation steps
- required credentials or external services
- configuration options
- example workflows or screenshots
- license and maintenance status

## Useful places to browse

This section separates **plugin catalogs** from **broader DSH-compatible projects** so readers can quickly tell whether a link is primarily for discovery or for a larger workflow integration.

### Plugin catalogs and directories

- [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) — broad community-maintained plugin list
- [0xsline/awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness) — ecosystem map of plugins, skills, tools, and infrastructure

### Broader DSH-compatible projects

These projects are useful examples and integrations in the ecosystem, but they may be larger products, plugin bundles, or adjacent tooling rather than single drop-in plugin packages.

#### Memory and knowledge

- [EverMind-AI/EverOS](https://github.com/EverMind-AI/EverOS) — portable memory layer for agent workflows
- [MemTensor/MemOS](https://github.com/MemTensor/MemOS) — persistent memory and retrieval system for agent runtimes

#### Design and output generation

- [nexu-io/open-design](https://github.com/nexu-io/open-design) — design-oriented workflows for coding agents
- [tt-a1i/archify](https://github.com/tt-a1i/archify) — architecture and system-diagram generation

#### Desktop and interface projects

- [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) — desktop packaging for the DSH ecosystem
- [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) — web-focused plugin aggregation and UI work

## Contributing

If you want to expand this repository, open a pull request that adds:

- a short description of the plugin or resource
- the problem it solves
- the install path if it is ready to use
- any compatibility notes that matter for adopters

Keep entries concise and prefer repositories with clear setup instructions.
