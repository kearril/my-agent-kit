---
slug: powertoys
title: "[开源项目] Microsoft PowerToys：Windows 系统级增强工具集"
type: project
summary: 微软官方维护的开源 Windows 系统增强工具箱，基于 Runner 模块化架构与集中式底层钩子，提供自定义分屏、屏幕 OCR 提取、全局快速启动、环境变量管理与资源管理器扩展。
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

Microsoft PowerToys 是微软官方主导并在 GitHub 开源的 Windows 桌面系统级增强工具箱。其主要作用是填补原生桌面在多窗口编排、快捷文本提取、开发环境配置以及资源管理器深度预览等场景中的功能缝隙。

### 安装途径

在 Windows 10（1803+）或 Windows 11 环境下，可以通过以下几种方式获取：

1. **WinGet 命令行安装（推荐）**

```powershell
# 安装到当前用户作用域
winget install Microsoft.PowerToys -s winget

# 或安装为全局计算机作用域
winget install --scope machine Microsoft.PowerToys -s winget
```

2. **应用商店与独立安装包**
   - **Microsoft Store**：在应用商店搜索 "Microsoft PowerToys" 安装，后续由商店提供静默后台更新。
   - **GitHub Releases**：在官方仓库 Releases 页面直接下载对应架构（x64 或 ARM64）的 `.exe` 安装引导包。

安装完成后，建议在设置中开启 "以管理员身份始终运行"（由内部 `restart_elevated` 模块调度），确保全局钩子在操作管理员权限运行的终端或 IDE 时正常生效。

---

## 架构机制与核心能力

根据源码设计，PowerToys 由中央常驻进程 `PowerToys.exe`（Runner）统一管理。Runner 通过扫描 `./modules` 目录动态装载实现 `PowertoyModuleIface` 接口的模块 DLL，并通过集中式底层键盘钩子（`centralized_kb_hook`）统一拦截并分发热键，避免多个工具各自注册钩子导致输入卡顿。设置面板则作为独立的 WinUI 3 进程，通过 Windows 命名管道（Named Pipes）与 Runner 进行双向 JSON 通信。

各子模块按功能场景主要划分为以下三类：

### 1. 窗口编排与工作区管理

- **FancyZones（自定义分屏网格）**
  突破原生 Windows 贴靠布局的固定限制，允许针对不同分辨率与显示器单独划分吸附区域（支持优先填充、网格切分与重叠区域）。按住 Shift 键拖拽窗口即可快速吸附至目标网格，在带鱼屏与多屏工作流中能显著减少手动缩放窗口的耗时。
- **Always on Top（窗口置顶）**
  使用快捷键 `Win + Ctrl + T` 可将任意活动窗口锁定在最前端，并在外侧渲染强调边框，适合在编码或查阅数据时固定参考文档或调试监视器。
- **Workspaces（工作区快照）**
  支持一键捕获当前桌面上打开的一组应用、窗口坐标与尺寸分布并保存为预设。在需要切换任务上下文时，可一键批量拉起并还原整套开发桌面。

### 2. 文本提取与快捷交互

- **Text Extractor（屏幕 OCR 抓词）**
  按下 `Win + Shift + T` 即可框选屏幕任意区域。底层直接调用 Windows 系统的 Media OCR 接口解析画面内容，并将文本即时写入剪贴板。对于弹窗报错信息、远程桌面或只读文档中的文本提取非常高效。
- **PowerToys Run（轻量全局启动器）**
  通过 `Alt + Space` 呼出轻量搜索栏。除了快速索引本地程序与文件，还内置了即时算式求解、单位与货币换算、注册表检索、运行中进程查询与 GUID 生成等插件。
- **Advanced Paste（高级剪贴板清洗）**
  使用 `Win + Shift + V` 唤起增强粘贴面板。可以将复制的内容快速转为纯文本、Markdown 格式或 JSON 结构，省去先贴入编辑器再手动清洗排版的中间环节。

### 3. 系统配置与文件辅助

- **Hosts 与环境变量编辑器**
  提供独立的可视化界面管理 Hosts 映射与系统环境变量。相比容易因格式或字符截断问题破坏配置的命令行指令，该面板能清晰区分用户变量与系统变量，并在修改前提供数据校验。
- **File Locksmith（文件占用排查）**
  当删除或移动文件提示 "文件已被另一程序打开" 时，在资源管理器中右键选中该文件并点击 "使用 File Locksmith 解锁"，即可查看持有该文件句柄的所有进程 PID，并支持直接结束进程。
- **Peek（空格键快速预览）与 File Explorer Add-ons**
  选中文件后按下 `Ctrl + Space`（可自定义为单空格键），即可直接弹出浮窗预览 Markdown、代码、图片或压缩包内容；同时在资源管理器中注入 SVG、Markdown、PDF 及 G-code 的预览窗格与缩略图引擎。

---

## 配置与运行建议

- **按需启用子模块**：在控制面板中停用不需要的子模块（如鼠标十字线、屏幕标尺等），Runner 会直接卸载对应的 DLL 模块，降低常驻内存占用。
- **避免热键冲突**：针对高频使用的模块（如 PowerToys Run 与 FancyZones），建议在设置中核对并按个人习惯定制快捷键，防止与 IDE 或终端的快捷操作发生碰撞。
