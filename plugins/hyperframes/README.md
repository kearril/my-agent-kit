# HyperFrames Plugin for Oh My Pi (omp)

原样收录 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)（HeyGen，“Write HTML. Render video.”）官方 Release 插件包中的全部技能，供 Oh My Pi (omp) 以插件形式安装。

---

## 项目说明

### 1. 核心定位
用 HTML/CSS/动画编写可逐帧寻址的合成（composition），由 HyperFrames CLI 确定性渲染为 MP4。技能教会 Agent 完整的生产闭环：规划 → 编写 HTML → 接入可寻址动画 → 引入媒体 → lint → 预览 → 渲染。

### 2. 架构适配决策
- **Release 包而非仓库克隆**：上游仓库约 500 MB，且其 `marketplace.json` 的插件源为仓库根目录 `./`，直接添加为市场会克隆并缓存整个仓库。本插件改为收录官方每个版本附带的 `hyperframes-agent-plugin.zip`（经 SHA-256 校验），只含插件运行所需内容。
- **收录范围**：`plugin.json`、`LICENSE`、`skills/<name>/`（21 个技能目录，含其私有脚本、参考文档与素材）。不收录 Claude/Codex/Cursor/Gemini 专用清单、品牌图标、`skills-manifest.json` 与 `skills/` 根部的上游测试文件。
- **必须保留 `plugin.json`**：路由技能据 `SKILL.md` 上两级目录中的 `plugin.json` 判定“插件安装模式”，其内置启动器 `skills/hyperframes/scripts/plugin-cli.mjs` 读取其中的 `version`，固定调用同版本 CLI（`npx hyperframes@<version>`），并禁止 `hyperframes skills update` 之类的独立技能刷新。
- **单一命令入口**：全部技能均允许模型自主调用，仅提供路由入口 `/hyperframes:hyperframes`，与上游在 Claude Code 中的入口一致。
- **极简零运行时**：不设 TS 扩展。

### 3. 版本与上游基准对齐
- **本地插件版本**：`v1.0.0`。
- **上游精确基线**：Release `v0.8.152`（`plugin.json` 版本 `0.8.152`，2026-10-13）。
- **市场目录声明 `version`**：`.omp-plugin/marketplace.json` 中本插件条目带 `version`（与 `package.json` 一致，由 `scripts/check.*` 校验），使 `omp plugin upgrade`（不带目标）与 `marketplace.autoUpdate: auto` 能识别新版本。

### 4. 运行依赖
- Node.js 22+ 与 npm（启动器首次调用会经 npm 下载固定版本 CLI）。
- FFmpeg（渲染）。
- `embedded-captions` 另需项目本地的 Sharp、Puppeteer（含 Chromium）与 GSAP，技能内给出版本化安装命令。

## 包含内容

### 1. 路由
- `hyperframes`：任何“做视频/动画/动效”请求的首读入口与能力地图，负责确认创作简报并分派到下列工作流。

### 2. 创作工作流（10 项）
- `product-launch-video`：网站/产品宣传片、站点导览、社媒短片。
- `faceless-explainer`：由任意文本生成无出镜讲解视频。
- `pr-to-video`：GitHub PR 生成变更讲解视频（依赖 `gh` CLI）。
- `embedded-captions`：为已有口播视频添加字幕（含主体后方嵌入效果）。
- `talking-head-recut`：为口播/访谈视频叠加设计化图形卡片。
- `motion-graphics`：10 秒内无旁白动效（动态文字、数据、Logo 等）。
- `music-to-video`：以音乐节拍驱动的视频。
- `slideshow`：可交互演示文稿（输出为可导航页面而非视频）。
- `general-video`：其余所有场景的兜底工作流，以及协作创作模式。
- `remotion-to-hyperframes`：将 Remotion 合成源码迁移为 HyperFrames HTML。

### 3. 领域技能（10 项，按需加载）
- `hyperframes-core`：合成契约（`data-*` 时间属性、轨道、子合成、确定性规则）。
- `hyperframes-animation`：动画规则、场景蓝图、转场与运行时适配器。
- `hyperframes-keyframes`：跨运行时的可寻址关键帧编写与诊断。
- `hyperframes-creative`：非动画创意方向（`frame.md`/`design.md`、配色、字体、旁白、节拍）。
- `hyperframes-audio`：合成内已有音频的混音、效果链与自动化。
- `hyperframes-cli`：CLI 开发闭环（init/lint/check/preview/render/云渲染）。
- `hyperframes-registry`：检索与接入注册表区块和组件。
- `hyperframes-studio`：Studio 可视化编辑器相关工作。
- `media-use`：媒体资源解析、生成、转写与复用（BGM、音效、图片、配音等）。
- `figma`：从 Figma 导入素材、令牌、组件与分镜。

### 4. OMP Slash Commands（1 个）
- `/hyperframes:hyperframes`：视频创作总入口，读取路由技能并按需求分派工作流。

---

## 维护铁律

1. **上游隔离原则**：本地上游镜像存放于 `.upstream/hyperframes/`（`.gitignore` 忽略，只读不可改），由 `scripts/sync-upstream.*` 下载最新 Release 插件包、校验 SHA-256 并解压；`.release-tag` 记录镜像对应的 Release。
2. **上游吸收流程**（升级到新 Release）：
   ```bash
   bash scripts/sync-upstream.sh            # 或 scripts/sync-upstream.ps1
   rm -rf plugins/hyperframes/skills
   cp -r .upstream/hyperframes/skills plugins/hyperframes/
   find plugins/hyperframes/skills -maxdepth 1 -type f -delete   # 去除 skills/ 根部的上游测试文件
   cp .upstream/hyperframes/plugin.json .upstream/hyperframes/LICENSE plugins/hyperframes/
   git add -f plugins/hyperframes           # 上游技能自带 .gitignore，会屏蔽其强制提交的夹具文件
   ```
   随后递增 `package.json` 版本，同步 `.omp-plugin/marketplace.json` 中的 `version`、`plugins/README.md` 与根 `README.md` 版本表，并更新本文件的上游基线。
3. **整包覆盖，不做裁剪**：技能目录保持与 Release 包逐字节一致，不删改单个技能或其资产；需要剔除技能时在本文件记录理由。
4. **语言分离原则**：技能 Frontmatter 与正文保持上游英文；命令 Frontmatter 的 `description` 使用中文。
