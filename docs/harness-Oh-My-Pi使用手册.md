---
links:
  - label: GitHub 仓库
    url: https://github.com/can1357/oh-my-pi
  - label: 官方文档
    url: https://github.com/can1357/oh-my-pi/tree/main/docs
---

# Oh My Pi (omp) 个人使用手册

## 一、 使用边界与核对基线

本文按 Oh My Pi `v18.1.6` 整理，核对时间为 2026 年 9 月 3 日。命令定义以官方文档和内建 Slash Command Registry 为准。

---

## 二、 执行模式与自主推进

| 命令 | 用途与要点 |
| --- | --- |
| `/plan [prompt]` | 切换规划模式。Agent 先调研和生成方案，再进入执行阶段；可带首条任务说明。 |
| `/plan-review` | 在规划模式中重新打开最近一次方案的评审界面。 |
| `/goal [objective]` | 设置或切换当前会话的持久自主目标。支持 `set`、`show`、`pause`、`resume`、`drop`、`budget`；预算可传数字或 `off`。 |
| `/guided-goal [rough objective]` | 由 Agent 通过对话澄清目标，再建立 Goal Mode。适合目标边界尚不清晰的长任务。 |
| `/loop [count\|duration] [prompt]` | 开启循环模式。下一条提示在 Agent 每次 yield 后自动再次提交；`Esc` 取消当前迭代，再次执行 `/loop` 关闭模式。 |
| `/queue <message>` | 将消息排入当前回合结束后的队列，不立即打断执行。 |
| `/vibe [prompt]` | 切换 Vibe Mode。主会话成为只读的协调者，只保留 `read`、可选的父级 `todo` 与 worker 控制工具；持久 worker 负责检索、编辑、构建和测试。`/vibe <prompt>` 会进入该模式并下发第一项任务。退出会终止该模式管理的所有 worker。 |
| `/prewalk` | 在下一次编辑或写入时切到 `@smol` 等低成本模型执行预走查，要求先形成 Todo。适合大改动前的快速机械准备。 |
| `/force:<tool-name> [prompt]` | 强制下一回合优先调用某个可用工具。工具名紧跟冒号，如 `/force:read 检查当前配置`。 |
| `/live` | 打开基于 Codex 的实时语音模式。该命令仅在交互 TUI 中可用。 |
| `/pause` | 冻结主 Agent、子 Agent 与 Advisor。正在进行的调用会到达安全边界后停驻；按 `Esc`、`Enter`、空格或 `Ctrl+C` 恢复。 |

`/vibe` 与 Plan Mode、Goal Mode 互斥，目标模式处于暂停状态时也必须先退出。Vibe Mode 中主会话不应直接修改文件，最终验收仍由协调者读取修改结果完成。

---

## 三、 模型、推理与工具面板

| 命令 | 用途与要点 |
| --- | --- |
| `/model`、`/models` | 打开模型选择器，按 Provider 查看并切换当前会话模型。 |
| `/switch` | 与 `Alt+P` 对应的模型切换入口。 |
| `/fast [on\|off\|status]` | 切换优先服务层。OpenAI 对应 `service_tier=priority`，Anthropic 对应 fast 路径；可用性取决于 Provider 和账户。 |
| `/extended-context [on\|off\|status]` | 切换付费的长上下文窗口。 |
| `/computer [on\|off\|status]` | 仅对当前会话启用或关闭原生 Computer Use 工具。 |
| `/vision [on\|off\|auto\|status]` | 控制 `inspect_image` 的暴露策略。`auto` 遵循全局设置，并会在模型自身具备视觉能力时隐藏委派工具。 |
| `/skillful [on\|off\|status]` | 仅对当前会话决定是否将可用 Skill 列表注入系统提示词。 |
| `/advisor [on\|off\|status\|dump\|configure]` | 控制 Advisor。Advisor 使用第二个模型审查每回合输出，并可注入提示；`dump` 导出其转录，`configure` 打开 TUI 配置。 |
| `/settings` | 打开设置面板。常规写入落到全局 `~/.omp/agent/config.yml`；项目级覆盖需要维护 `<cwd>/.omp/config.yml`。 |
| `/setup [providers]`、`/providers` | 打开服务商登录、模型与 Web Search Provider 的设置流程。 |
| `/tools` | 显示当前真正暴露给模型的工具列表。 |
| `/context` | 显示上下文用量估算与各部分占比。 |
| `/hotkeys` | 显示当前快捷键映射。按键可被 `keybindings.yml` 覆盖。 |

---

## 四、 上下文、会话与分支

### 上下文维护

| 命令 | 用途与要点 |
| --- | --- |
| `/compact [instructions]` | 手动压缩当前会话上下文。可附带保留重点，例如 `/compact 保留数据层重构的接口决策`。自动维护还可能采用远程压缩、Snapcompact、handoff、shake 或摘要压缩。 |
| `/shake [elide\|images\|thinking]` | 机械清除历史中的重内容。`elide` 为默认值，处理工具结果和大块文本；`images` 删除图像块；`thinking` 删除思维块。 |
| `/handoff` | 生成交接文档，并将摘要作为压缩记录写入当前会话。它保留会话身份和转录，不等同于直接创建空会话。 |
| `/fresh` | 重置 Provider 侧流、缓存和会话状态，保留本地转录、会话文件和可见对话。适合服务端会话漂移、提示缓存异常或流式请求卡死后的恢复。 |
| `/clear` | 原地清空 Agent 的活动上下文和界面转录，保留会话身份、元数据与磁盘上的完整历史；会追加 `reset_boundary`，之后的上下文从新边界重建。 |
| `/new` | 创建一个空白会话。 |
| `/drop` | 尝试删除当前持久化会话及其工件后创建新会话。删除属于尽力而为操作，文件系统拒绝删除时旧工件可能残留。 |
| `/retry` | 重试上一回合失败的 Agent 执行。 |

### 恢复与分支

| 命令 | 用途与要点 |
| --- | --- |
| `/resume [session id\|@claude\|@codex]` | 切换到已有 OMP 会话；无参数时打开选择器。`@claude` 与 `@codex` 用于选择并导入外部会话。 |
| `/pin [session id]` | 固定或取消固定会话，影响恢复列表中的排序。 |
| `/branch`、`/rewind` | 从历史用户消息回退，同时保留原路径为分支。默认行为会建立新的会话分支文件。 |
| `/fork` | 从当前或所选历史消息创建新的会话分叉。 |
| `/tree` | 在同一个会话文件的树形历史中导航和切换分支，不复制原始历史。 |
| `/rename <title>` | 重命名当前会话。 |
| `/move <directory>` | 将当前会话迁移到另一个目录。 |
| `/wt`、`/worktree` | 将当前会话转入新的 Git Worktree，并携带当前改动。 |
| `/add-dir <directory>` | 向当前会话加入额外工作目录。 |
| `/remove-dir <directory>` | 移除已加入的额外工作目录。 |
| `/dirs` | 显示当前会话的工作目录集合。 |
| `/restart` | 使用原启动参数重启 OMP，并原地恢复当前会话。 |

`/branch` 与 `/tree` 的存储边界不同。前者处理跨会话的分支文件，后者只移动当前会话文件的活动叶节点。需要保留两个方案的完整上下文时，优先使用 `/branch`；需要在同一会话树中比较历史路径时使用 `/tree`。

### 转录、导出与运行状态

| 命令 | 用途与要点 |
| --- | --- |
| `/dump` | 将完整转录复制到剪贴板，并尽力在系统临时目录写入 LLM 请求 JSON。该 JSON 可能含原始上下文或敏感信息，应按敏感工件处理。 |
| `/export [--themes] [path]` | 导出当前会话为 HTML。`--themes` 使用配置中的深浅主题；导出路径解析不保留带空格路径的引号语义。 |
| `/share` | 创建端到端加密的会话分享链接。链接片段携带解密密钥，获得链接的人可读取其中的转录与上下文。 |
| `/trace` | 在本地 Stats Dashboard 中打开当前会话的追踪记录。 |
| `/jobs` | 查看后台异步任务与已结算任务。 |
| `/stats [--port <port>] [--host <host>]` | 启动本地统计仪表盘。 |
| `/session info` | 查看当前会话的基础信息与统计。 |
| `/session delete` | 删除当前会话并返回选择器。 |
| `/session pin [account]` | 将当前 Provider 固定到指定已保存的 OAuth 账户。 |
| `/usage [show\|reset]` | 查看 Provider 用量与限制；`reset` 消耗已保存的 Codex 额度重置机会。 |
| `/changelog [full]` | 查看更新日志，`full` 显示完整内容。 |
| `/btw <question>` | 借用当前上下文发起临时的旁路问题。 |
| `/tan <work>` | 为旁支工作启动完整后台 Agent。 |
| `/debug` | 打开调试工具选择器。 |

---

## 五、 任务、多 Agent 与记忆

| 命令 | 用途与要点 |
| --- | --- |
| `/todo` | 查看任务列表。 |
| `/todo edit` | 在 `$EDITOR` 中通过 Markdown 往返编辑任务。 |
| `/todo copy` | 将任务清单复制为 Markdown。 |
| `/todo expand`、`/todo collapse` | 展开全部阶段和任务，或恢复有限高度的 HUD 预览。 |
| `/todo export [path]` | 将任务写入 Markdown，默认文件名为 `TODO.md`。 |
| `/todo import [path]` | 从 Markdown 替换当前任务清单，默认读取 `TODO.md`。 |
| `/todo append [phase] <task>` | 追加任务。阶段可模糊匹配或自动创建。 |
| `/todo start <task>` | 将匹配任务置为进行中。 |
| `/todo done [task\|phase]` | 将匹配的任务、阶段或全部任务标记为完成。 |
| `/todo drop [task\|phase]` | 将匹配的任务、阶段或全部任务标记为放弃。 |
| `/agents` | 打开 Agent Hub，可查看每个子 Agent 的模型、Prewalk 与 Advisor 状态。 |
| `/hub` | 打开实时 Agent Hub。可查看、跟进、唤醒或终止关联子 Agent。 |
| `/memory view` | 显示当前记忆后端注入到系统提示词中的内容。 |
| `/memory stats`、`/memory diagnose` | 查看后端统计与诊断。 |
| `/memory queue`、`/memory sync` | 查看待整合的记忆增量，或立即执行整合。 |
| `/memory clear`、`/memory reset` | 清理持久化记忆数据与工件。`reset` 是 `clear` 的别名。 |
| `/memory enqueue`、`/memory rebuild` | 请求后续记忆维护或重建。 |
| `/memory mm ...` | 维护 Hindsight Mental Model，包含 `list`、`show`、`refresh`、`history`、`seed`、`delete`、`reload`。仅在对应后端启用时可用。 |

任务状态由 Agent 的 `todo` 工具和 `/todo` 共同维护。任务名称和阶段名称用于精确或模糊定位，避免反复使用近似但不一致的名称。

---

## 六、 协作、浏览与项目操作

### 实时协作

| 命令 | 用途与要点 |
| --- | --- |
| `/collab` | 启动可写的实时协作，并输出终端链接、浏览器深链接和二维码。再次运行会重新显示当前链接。 |
| `/collab view` | 创建只读协作链接。访客可阅读转录与工具活动，不能发送提示、打断执行或操控子 Agent。 |
| `/collab status` | 显示协作链接与参与者。 |
| `/collab stop` | 停止协作。 |
| `/join <link>` | 加入共享会话。 |
| `/leave` | 访客离开协作；主机执行时停止当前共享。 |

协作链接本身是权限边界。完整链接带有写入令牌，拥有它的访客可提示 Agent、发送中断并操作 Agent Hub；只读链接只提供会话观察能力。两类链接都应按密钥处理。

### 浏览、代码与诊断

| 命令 | 用途与要点 |
| --- | --- |
| `/browser [headless\|visible]` | 切换浏览器工具的无头或可见模式。 |
| `/copy [text]` | 从会话中挑选文本或代码复制；可带参数直接指定目标。 |
| `/open [link]` | 打开会话中最近出现的链接，或从 `/copy` 的候选中选择。 |
| `/git [revision]` | 打开全屏 Git UI，包含分屏 Diff、暂存区与提交信息编辑器。 |
| `/cleanse [request] [--all]` | 检测并修复项目诊断问题，使用带权重的并行子 Agent。 |
| `/omfg <complaint>` | 根据重复问题生成 TTSR 规则，用于约束后续 Agent 行为。 |

---

## 七、 MCP、SSH、插件与安全扫描

| 命令 | 用途与要点 |
| --- | --- |
| `/mcp add` | 添加 MCP Server，可指定用户或项目作用域、URL，或在 `--` 后给出 stdio 启动命令。 |
| `/mcp list`、`/mcp remove`、`/mcp test` | 列出、删除或测试 MCP Server。 |
| `/mcp reauth`、`/mcp unauth` | 为 MCP Server 重新授权，或移除其 OAuth 授权。 |
| `/mcp enable`、`/mcp disable` | 启用或禁用某个 MCP Server。 |
| `/mcp reconnect`、`/mcp reload` | 重连单个 Server，或强制重载 MCP Runtime 工具。 |
| `/mcp resources`、`/mcp prompts`、`/mcp notifications` | 查看 MCP 提供的资源、提示词与通知能力。 |
| `/mcp smithery-search` | 搜索 Smithery Registry 并部署 MCP Server。 |
| `/mcp smithery-login`、`/mcp smithery-logout` | 管理 Smithery API Key。 |
| `/ssh add`、`/ssh list`、`/ssh remove` | 管理 SSH 主机定义。`add` 支持主机、用户、端口、私钥路径及用户/项目作用域。 |
| `/marketplace ...` | 管理 Marketplace 来源和插件，包含 `add`、`remove`、`update`、`list`、`discover`、`install`、`uninstall`、`installed`、`upgrade`、`help`。 |
| `/plugins [list\|enable\|disable]` | 查看、启用或停用已安装插件。 |
| `/reload-plugins` | 重载插件相关运行时状态，包括 Skill、Slash Command、Hook、工具、Agent 和 MCP。 |
| `/extensions`、`/status` | 打开扩展控制中心，查看已发现能力和被覆盖的命令。 |
| `/security ...` | 管理 OMP 原生安全扫描，包含 `plan`、`scan`、`status`、`cancel`、`scans`、`show`、`import`、`export`、`validate`、`compare`、`disposition`。安全功能默认关闭，需先启用 `security.enabled`；原生扫描还要求 Git 仓库、可用模型和对应 Provider 的 OAuth 凭据。 |

---

## 八、 账户与退出

| 命令 | 用途与要点 |
| --- | --- |
| `/login [provider\|redirect URL]` | 登录 OAuth Provider。 |
| `/logout [provider]` | 登出 OAuth Provider。 |
| `/exit` | 退出应用。 |
| `/quit`、`/q` | 退出应用的别名。 |

---

## 九、 Magic Keywords

Magic Keywords 写在普通提示词中，不需要斜杠。命中后，OMP 会向当前回合注入隐藏的用户归属提示；关键字文本仍会保留在可见消息中。

| 关键字 | 当前行为 |
| --- | --- |
| `ultrathink` | 注入多步审慎推理提示。启用自动思考时，为当前模型选择它支持的最高推理力度。 |
| `orchestrate` | 注入多 Agent 编排约束：拆分独立工作流、并发调度、分阶段验收，并持续执行直到请求完成。 |
| `workflowz` | 注入围绕 `eval` 持久内核、`agent()`、`parallel()`、`pipeline()` 和 `completion()` 的确定性多 Agent 工作流约束。仅当 `eval` 与 `task` 同时启用时生效。 |

匹配规则：

- 必须使用完全小写的独立英文单词。`Ultrathink`、`orchestrated`、`orchestrate.ts`、`orchestrate()` 均不触发。
- 关键字可以紧邻句末标点或引号，不能紧邻字母、数字、下划线、路径分隔符、连字符和调用符号。
- 行内代码、围栏代码块、HTML/XML 标签和注释中的文本不会触发。
- 多个关键字可在同一条提示中同时生效。
- 设置项可分别关闭全局开关或单个关键字的隐藏注入；编辑器高亮目前仍会显示。
