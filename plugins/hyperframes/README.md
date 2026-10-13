# HyperFrames Plugin for Oh My Pi (omp)

原样收录 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)（HeyGen，“Write HTML. Render video.”）官方 Release 插件包中的全部技能，供 Oh My Pi (omp) 以插件形式安装。

---

## 项目说明

### 1. 核心定位
用 HTML/CSS/动画编写可逐帧寻址的合成（composition），由 HyperFrames CLI 确定性渲染为 MP4。技能教会 Agent 完整的生产闭环：规划 → 编写 HTML → 接入可寻址动画 → 引入媒体 → lint → 预览 → 渲染。

### 2. 架构适配决策
- **Release 包而非仓库克隆**：上游仓库约 500 MB，且其 `marketplace.json` 的插件源为仓库根目录 `./`，直接添加为市场会克隆并缓存整个仓库。本插件改为收录官方每个版本附带的 `hyperframes-agent-plugin.zip`（经 SHA-256 校验），只含插件运行所需内容。
- **收录范围**：`plugin.json`、`LICENSE`、`skills/` 下全部技能目录（含其私有脚本、参考文档与素材），由 `scripts/absorb.mjs` 生成。不收录 Claude/Codex/Cursor/Gemini 专用清单、品牌图标、`skills-manifest.json` 与 `skills/` 根部的上游测试文件。
- **必须保留 `plugin.json`**：路由技能据 `SKILL.md` 上两级目录中的 `plugin.json` 判定“插件安装模式”，其内置启动器 `skills/hyperframes/scripts/plugin-cli.mjs` 读取其中的 `version`，固定调用同版本 CLI（`npx hyperframes@<version>`），并禁止 `hyperframes skills update` 之类的独立技能刷新。
- **单一命令入口**：全部技能均允许模型自主调用，仅提供路由入口 `/hyperframes:hyperframes`，与上游在 Claude Code 中的入口一致。
- **极简零运行时**：不设 TS 扩展。

### 3. 版本与上游基线
本地版本与上游 Release 基线见 [`plugins/README.md`](../README.md) 版本表，由每周自动同步维护（每吸收一个新 Release 递增 patch 版本）。市场条目声明 `version`，使 `omp plugin upgrade`（不带目标）与 `marketplace.autoUpdate: auto` 能识别新版本。

### 4. 运行依赖
- Node.js 22+ 与 npm（启动器首次调用会经 npm 下载固定版本 CLI）。
- FFmpeg（渲染）。
- `embedded-captions` 另需项目本地的 Sharp、Puppeteer（含 Chromium）与 GSAP，技能内给出版本化安装命令。

## 包含内容

- **技能**：路由技能 `hyperframes` 是任何“做视频/动画/动效”请求的首读入口与能力地图，负责确认创作简报并分派到创作工作流（宣传片、无出镜讲解、PR 讲解、字幕、口播图形、动效、音乐视频、幻灯片、Remotion 迁移等）与按需加载的领域技能（合成契约、动画、关键帧、创意方向、音频、CLI、注册表、Studio、媒体、Figma）。技能全集以 `skills/` 与上游文档为准。
- **OMP Slash Commands**：`/hyperframes:hyperframes`，视频创作总入口，读取路由技能并按需求分派工作流。

---

## 维护铁律

1. **上游隔离原则**：本地上游镜像存放于 `.upstream/hyperframes/`（`.gitignore` 忽略，只读不可改），由 `scripts/sync-upstream.*` 下载最新 Release 插件包、校验 SHA-256 并解压；`.release-tag` 记录镜像对应的 Release。
2. **自动吸收**：`.github/workflows/upstream-sync.yml` 每周运行 `scripts/absorb.mjs`，整体替换 `skills/`、`plugin.json`、`LICENSE` 并开自动合并 PR；本地手动执行 `bash scripts/sync-upstream.sh && node scripts/absorb.mjs hyperframes` 效果相同（脚本以 `git add -f` 暂存，规避上游技能自带 `.gitignore` 屏蔽其夹具文件）。
3. **整包覆盖，不做裁剪**：技能目录保持与 Release 包逐字节一致；如需剔除技能，改 `scripts/absorb.mjs` 的收纳规则并在本文件记录理由。
4. **语言分离原则**：技能 Frontmatter 与正文保持上游英文；命令 Frontmatter 的 `description` 使用中文。
