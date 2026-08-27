---
slug: powertoys
title: "[开源项目] Microsoft PowerToys：Windows 系统级增强工具集"
type: project
summary: 微软官方维护的开源 Windows 系统增强工具箱，提供高级窗口平铺、全局快速启动、屏幕 OCR 提取、环境变量管理与资源管理器扩展。
tags:
  - Windows
  - 效率工具
  - 开源项目
  - 系统增强
  - 开发环境
source: external
links:
  - label: GitHub 仓库
    url: https://github.com/microsoft/PowerToys
  - label: 官方文档
    url: https://learn.microsoft.com/windows/powertoys/
  - label: GitHub Releases
    url: https://github.com/microsoft/PowerToys/releases
related: []
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-27
draft: false
---

## 工具定位与安装方式

Microsoft PowerToys 是微软官方主导并开源的 Windows 桌面增强工具箱。它的主要作用是补齐原生系统在多窗口编排、高频文本提取以及系统底层调试等场景中的细节缺失，让常规桌面操作更加顺手。

### 安装途径

在 Windows 10 或 Windows 11 环境下，可以通过以下几种方式获取：

1. **WinGet 命令行安装（推荐）**

```powershell
# 安装到当前用户作用域
winget install Microsoft.PowerToys -s winget

# 或安装为全局计算机作用域
winget install --scope machine Microsoft.PowerToys -s winget
```

2. **应用商店与安装包**
   - **Microsoft Store**：在微软应用商店搜索 "Microsoft PowerToys" 点击安装，后续支持静默后台更新。
   - **GitHub Releases**：直接前往仓库 Releases 页面，根据机器架构下载 x64 或 ARM64 的独立 `.exe` 安装包。

安装完成后，建议在通用设置中开启 "以管理员身份始终运行"，以确保窗口管理等全局钩子在操作提权软件（如管理员终端）时依然生效。

---

## 核心功能与典型场景

PowerToys 由多个独立的子工具组成，日常使用频率最高的模块主要集中在以下三个方向：

### 1. 窗口编排与工作区管理

- **FancyZones（自定义分屏网格）**
  原生 Windows 的贴靠布局规则相对固定。FancyZones 允许针对不同显示器单独划分吸附区域，支持优先填充、网格切分与重叠区域。按住 Shift 键拖拽窗口即可快速落入对应网格，在带鱼屏或多屏协作时能显著减少手动调整窗口大小的耗时。
- **Always on Top（窗口置顶）**
  使用快捷键 `Win + Ctrl + T` 可以把任意活动窗口固定在屏幕最前端，并在外侧高亮边框提示，适合在编码或核对数据时固定文档或参考窗口。
- **Workspaces（工作区快照）**
  支持将当前屏幕上打开的一组应用、窗口尺寸和坐标位置保存为预设。当需要进入特定开发或写作任务时，一键即可拉起并还原整套窗口排布。

### 2. 文本提取与快捷交互

- **Text Extractor（屏幕 OCR 抓词）**
  按下 `Win + Shift + T` 即可框选屏幕上的任意区域。底层直接调用系统内置的 OCR 引擎解析画面内容，并把识别出的文字即时写入剪贴板。在遇到不可直接选中的报错弹窗、图片文档或远程桌面时非常实用。
- **PowerToys Run（轻量全局启动器）**
  通过 `Alt + Space` 呼出搜索栏。除了快速索引本地软件和文件，它还内置了多种实用插件，例如直接输入数学算式求解、执行单位与货币换算、查找正在运行的进程或生成 GUID。
- **Advanced Paste（高级剪贴板清洗）**
  使用 `Win + Shift + V` 唤起增强粘贴面板。可以将复制的内容快速转为纯文本、Markdown 格式或 JSON 结构，避免先贴入编辑器再手动排版的繁琐步骤。

### 3. 系统配置与文件辅助

- **Hosts 与环境变量编辑器**
  提供独立的可视化界面管理 Hosts 域名映射与系统环境变量。相比容易因格式问题破坏配置的命令行指令，可视化面板能清晰区分用户变量与系统变量，并在修改前提供校验。
- **File Locksmith（文件占用排查）**
  当删除或移动文件提示 "文件已被另一程序打开" 时，在资源管理器中右键选中该文件并点击 "使用 File Locksmith 解锁"，即可列出持有该文件句柄的所有进程 PID，并支持直接结束进程。
- **Peek（空格键快速预览）**
  选中文件后按下 `Ctrl + Space`（可自定义为单空格键），即可直接弹出浮窗预览 Markdown、代码、图片或压缩包内容，不需要等待完整软件加载启动。

---

## 配置与运行建议

- **按需启用子模块**：PowerToys 采用模块化常驻机制。建议在安装后进入控制面板，将平时不需要的子模块（如鼠标十字线、颜色选择器等）保持关闭状态，这样可以减少常驻内存开销并降低全局热键冲突的几率。
- **保持权限对齐**：如果平时频繁使用管理员权限运行终端或 IDE，请确保 PowerToys 主程序也处于管理员运行状态，避免出现低权限工具无法捕获高权限窗口事件的情况。
