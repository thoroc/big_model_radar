# OpenClaw 生态日报 2026-05-11

> Issues: 500 | PRs: 500 | 覆盖项目: 12 个 | 生成时间: 2026-05-11 01:49 UTC

- [OpenClaw](https://github.com/openclaw/openclaw)
- [NanoBot](https://github.com/HKUDS/nanobot)
- [Zeroclaw](https://github.com/zeroclaw-labs/zeroclaw)
- [PicoClaw](https://github.com/sipeed/picoclaw)
- [NanoClaw](https://github.com/qwibitai/nanoclaw)
- [IronClaw](https://github.com/nearai/ironclaw)
- [LobsterAI](https://github.com/netease-youdao/LobsterAI)
- [TinyClaw](https://github.com/TinyAGI/tinyclaw)
- [Moltis](https://github.com/moltis-org/moltis)
- [CoPaw](https://github.com/agentscope-ai/CoPaw)
- [ZeptoClaw](https://github.com/qhkm/zeptoclaw)
- [EasyClaw](https://github.com/gaoyangz77/easyclaw)

---

## OpenClaw 项目深度报告

# OpenClaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

OpenClaw 项目在 2026-05-11 继续保持高活跃度，24 小时内处理了 **500 条 Issues 更新**（新开/活跃 444 条，关闭 56 条）和 **500 条 PR 更新**（待合并 450 条，已合并/关闭 50 条），显示出社区参与度与核心团队响应效率均处于高位。项目发布了两个新版本（`v2026.5.10-beta.1` 与 `v2026.5.10-beta.2`），重点增强了 QA/Mantis 模块对 Telegram 实时 PR 证据自动化支持。尽管存在多个回归性 Bug 报告，但核心团队通过快速合并修复 PR（如 #80491、#80471、#80255）展现了较强的工程响应能力。

---

## 2. 版本发布

### 🔖 v2026.5.10-beta.2（最新）
- **发布时间**：2026-05-10  
- **核心更新**：
  - QA/Mantis：集成 Convex 租赁凭证实现 Telegram 实时 PR 证据自动化，支持 Crabbox 转录捕获、动态 GIF 预览及内联 PR 评论。
  - QA/Mantis：新增 Telegram Desktop 场景构建器，支持自动租赁 Crabbox、安装原生 Telegram Desktop 并完成 OpenClaw 配置。
- **迁移注意**：无破坏性变更，但需确保测试环境具备 Convex 和 Crabbox 访问权限以启用新功能。

### 🔖 v2026.5.10-beta.1
- 内容同上，为 beta.2 的前置版本，主要差异为内部构建编号。

> 📌 发布链接：[v2026.5.10-beta.2](https://github.com/openclaw/openclaw/releases/tag/v2026.5.10-beta.2)

---

## 3. 项目进展

今日有 **50 个 PR 被合并或关闭**，重点推进方向包括：

- **Codex 运行时稳定性修复**：
  - #80255：修复 active-memory recall 子代理在主线程中死锁问题（[#79026](https://github.com/openclaw/openclaw/issues/79026)）。
  - #79513：优化 Codex app-server 客户端池化策略，避免多代理切换时连接重建开销。
- **通道交付安全增强**：
  - #80491：过滤 phase-tagged 提供商（如 openai-codex）返回的 `commentary` 内容，防止推理过程泄露至用户端（如 Telegram）。
- **配置与运维改进**：
  - #80471：将 `plugins.deny` 中缺失插件 ID 视为“陈旧配置警告”而非致命错误，提升 `doctor --fix` 清理能力。
  - #80068：保留 iMessage 健康探测失败的非敏感快照，便于诊断而不暴露隐私路径。

> ✅ 整体项目在 **运行时稳定性、安全边界、运维体验** 三方面取得实质性进展。

---

## 4. 社区热点

### 🔥 高讨论度 Issues（评论数 ≥7）

| Issue | 主题 | 链接 |
|------|------|------|
| #48183 | Feishu 插件 monitor.state.ts 存在潜在内存泄漏（httpServers Map 清理不完整） | [查看](https://github.com/openclaw/openclaw/issues/48183) |
| #47940 | Heartbeat 实际间隔为配置值 2 倍（交替发送成功与静默 ok-token） | [查看](https://github.com/openclaw/openclaw/issues/47940) |
| #76562 | 升级至 2026.4.29+/5.2 后出现高 CPU、RPC 延迟与轮询不稳定 | [查看](https://github.com/openclaw/openclaw/issues/76562) |
| #45740 | gh-issues skill 直接将未消毒的 issue body 注入子代理提示（安全风险） | [查看](https://github.com/openclaw/openclaw/issues/45740) |
| #43747 | 内存管理混乱：不同用户行为不一致（chunking/embedding vs 直接存储） | [查看](https://github.com/openclaw/openclaw/issues/43747) |

**背后诉求分析**：  
用户普遍关注 **系统稳定性（内存/性能）** 与 **安全边界（输入消毒、内部信息泄露）**。#76562 反映版本升级引入的性能回归已影响生产环境，需紧急响应；#45740 揭示技能层缺乏输入验证机制，可能成为供应链攻击入口。

---

## 5. Bug 与稳定性

### ⚠️ 严重 Bug（按优先级排序）

| Issue | 描述 | 状态 | 关联 PR |
|------|------|------|--------|
| #76562 | 升级后网关 CPU 达 100%，控制平面 RPC 延迟剧增 | 🟡 调查中 | — |
| #48183 | Feishu monitor 停止时 httpServers Map 未等待关闭即删除，导致内存泄漏 | 🟡 未修复 | — |
| #45759（已关闭） | Telegram typing keepalive 循环无断路器，网络失败时持续调用致网关崩溃 | ✅ 已修复 | — |
| #76877（已关闭） | 2026.5.2 代理中途停止响应（工具使用后无输出） | ✅ 已关闭 | — |
| #44925 | 子代理完成结果静默丢失，无重试/通知/自动重启 | 🟡 未修复 | — |

> 💡 建议优先处理 #76562（性能回归）与 #48183（内存泄漏），二者均影响系统可用性。

---

## 6. 功能请求与路线图信号

### 📌 高潜力功能请求（👍 ≥3 或已有相关 PR）

| Issue | 功能描述 | 社区支持 | 相关 PR |
|------|--------|--------|--------|
| #39604 | 添加 `tools.web.fetch.allowPrivateNetwork` 配置以允许访问私有网络 | 👍 6 | — |
| #45608 | `/new` 和每日重置前执行 agentic memory flush（同 compaction 机制） | 👍 3 | — |
| #42840 | 在 Control UI 中支持 MathJax/LaTeX 渲染 | 👍 4 | — |
| #28300 | 主题定制系统：预设主题 + 自定义主题工作室 | 👍 5 | — |
| #45758 | 支持 YAML 作为配置文件格式（替代 JSON5） | 👍 1 | — |

**路线图判断**：  
`allowPrivateNetwork`（#39604）和 `memory flush`（#45608）因解决明确痛点且实现成本低，**极可能纳入 v2026.5.11**；UI 类功能（MathJax、主题）预计进入中期规划。

---

## 7. 用户反馈摘要

- **满意点**：
  - Telegram 实时 PR 证据自动化（beta 版本）获测试者好评，显著提升 QA 效率。
  - `doctor --fix` 对陈旧配置的清理能力增强（#80471）被赞“运维友好”。
- **痛点**：
  - **升级风险高**：多个用户报告从 2026.4.24 升级至 5.x 后出现性能劣化（#76562）、代理无响应（#76877）。
  - **技能安全缺失**：开发者担忧 `gh-issues` 等技能直接注入原始内容（#45740），呼吁内置扫描机制（#45031）。
  - **内存行为不一致**：同一版本下不同用户内存管理策略差异大（#43747），缺乏文档说明。

---

## 8. 待处理积压

### ⏳ 长期未响应重要 Issue（>30 天未更新）

| Issue | 类型 | 最后更新时间 | 提醒 |
|------|------|------------|------|
| #39476 | A2A `sessions_send` 双向调用导致重复消息 | 2026-03-08 | 影响多代理协作可靠性 |
| #43367 | 多代理编排不稳定：并发配置覆盖、会话锁失败 | 2026-03-11 | 阻碍企业级并行任务 |
| #38439 | Webchat 头像接口 `/avatar/{agentId}` 返回 404 | 2026-03-07 | 基础 UI 功能失效 |

> 🔔 建议维护者在本周内对上述 Issue 进行 triage，至少标记为 `needs-investigation` 或分配负责人。

---

**报告生成时间**：2026-05-11  
**数据来源**：OpenClaw GitHub Repository（github.com/openclaw/openclaw）  
**分析师备注**：项目整体健康度良好，但需警惕性能回归与内存泄漏类问题对稳定性的长期影响。建议加强版本发布前的性能基准测试。

---

## 横向生态对比

# 个人 AI 助手/自主智能体开源生态横向对比分析报告  
**报告时间：2026-05-11**

---

## 1. 生态全景

当前个人 AI 助手与自主智能体开源生态呈现 **高活跃度、强工程化、多架构并存** 的态势。核心项目普遍聚焦于 **多代理协作、安全边界强化、多模态集成** 三大方向，同时面临 **性能回归、配置一致性、生产部署稳定性** 等共性挑战。社区参与度整体健康，但部分项目存在响应延迟或文档缺失问题，影响新用户上手与长期信任。整体生态正从“功能堆叠”向“架构治理”演进。

---

## 2. 各项目活跃度对比

| 项目 | Issues 更新数 | PR 更新数 | 新版本发布 | 健康度评估 |
|------|---------------|-----------|-------------|------------|
| **OpenClaw** | 500 | 500 | ✅ v2026.5.10-beta.2 | ⭐⭐⭐⭐⭐（高活跃，强响应） |
| **NanoBot** | 5 | 6 | ❌ | ⭐⭐⭐☆☆（稳定但响应慢） |
| **Zeroclaw** | 21 | 29 | ❌ | ⭐⭐⭐⭐☆（高强度维护中） |
| **PicoClaw** | 4 | 5 | ✅ nightly v0.2.8 | ⭐⭐⭐☆☆（修复准备期） |
| **NanoClaw** | 19 | 21 | ❌ | ⭐⭐⭐⭐☆（高迭代，安全加固） |
| **IronClaw** | 8 | 28 | ❌ | ⭐⭐⭐⭐☆（架构重构深水区） |
| **LobsterAI** | 1 | 16 | ❌ | ⭐⭐⭐☆☆（密集修复，PR积压） |
| **Moltis** | 1 | 0 | ✅ v20260510.01 | ⭐⭐⭐⭐☆（稳定维护） |
| **CoPaw** | 12 | 10 | ❌ | ⭐⭐⭐☆☆（社区驱动，响应积极） |
| **ZeptoClaw** | 0 | 1 | ❌ | ⭐⭐⭐☆☆（架构演进中，低互动） |
| **TinyClaw / EasyClaw** | 0 | 0 | ❌ | ⭐⭐☆☆☆（休眠状态） |

> 注：健康度综合考量活跃度、响应速度、稳定性、社区反馈。

---

## 3. OpenClaw 在生态中的定位

OpenClaw 是当前生态中 **唯一实现日均千级社区交互（500 Issues + 500 PRs）** 的项目，展现出远超同类的技术影响力与工程成熟度。其优势在于：
- **实时协作能力领先**：率先集成 Telegram 实时 PR 证据自动化（Convex + Crabbox），打通开发-测试闭环；
- **安全边界清晰**：主动过滤推理过程泄露（#80491）、强化输入消毒（#45740 讨论）；
- **运维体验优化**：`doctor --fix` 增强、配置迁移无破坏性变更。

相较之下，其他项目多聚焦单一维度（如 NanoClaw 重安全、Zeroclaw 推多代理、CoPaw 强社区），而 OpenClaw 在 **端到端工作流整合** 上形成差异化壁垒。

---

## 4. 共同关注的技术方向

| 技术方向 | 涉及项目 | 具体诉求 |
|--------|--------|--------|
| **多代理运行时与隔离** | Zeroclaw（v0.8.0）、IronClaw（Reborn）、OpenClaw（A2A） | 支持独立工作区、权限控制、会话隔离（#6545, #3457, #39476） |
| **输入安全与内容消毒** | OpenClaw（#45740）、CoPaw（#4183）、NanoBot（#2829） | 防止未过滤内容注入提示词，避免供应链攻击 |
| **配置一致性与迁移** | Zeroclaw（#6523）、PicoClaw（#2225）、LobsterAI（#1584） | 环境变量覆盖、路径隔离、UUID 替代名称生成 |
| **语音/多模态本地支持** | NanoBot（#3723）、NanoClaw（#2003）、CoPaw（#4178） | 默认本地 whisper.cpp，可选云回退，保障隐私 |
| **CLI 工具链统一** | NanoClaw（#2397）、IronClaw（#3455） | 提供 `ncl tasks`、独立 CLI 入口，降低操作成本 |

---

## 5. 差异化定位分析

| 项目 | 功能侧重 | 目标用户 | 技术架构关键差异 |
|------|--------|--------|----------------|
| **OpenClaw** | 端到端开发协作流 | 开发者、QA 团队 | 事件驱动 + 实时证据链 + 多通道同步 |
| **Zeroclaw** | 多代理编排与 SOP 引擎 | 企业自动化团队 | V3 多代理运行时 + 配置 schema 强隔离 |
| **NanoClaw** | 主权优先与沙箱安全 | 隐私敏感型个人/小团队 | 容器化隔离 + rootless 设计 + 本地语音默认 |
| **IronClaw** | 分布式任务调度 | 基础设施开发者 | Reborn 架构 + 强类型 ID + 租约机制 |
| **CoPaw** | 插件化工具生态 | 二次开发社区 | Memory Distill + OpenWond Draw 等创新插件 |
| **LobsterAI** | MCP 协议兼容性 | 工具集成开发者 | 聚焦 MCP 流式支持与 BrainMaker 对接 |

---

## 6. 社区热度与成熟度

- **快速迭代阶段**：OpenClaw、NanoClaw、Zeroclaw、IronClaw  
  特征：日均 PR >15，核心模块密集重构，响应时效 <24h。
- **质量巩固阶段**：LobsterAI、PicoClaw、CoPaw  
  特征：PR 积压明显（>10 待合并），聚焦 Bug 修复与 UX 优化，发布节奏放缓。
- **架构演进期**：ZeptoClaw、Moltis  
  特征：低 Issue 量，高架构 PR 占比，社区观察为主。
- **休眠/边缘项目**：TinyClaw、EasyClaw  
  无活动，生态影响力趋零。

---

## 7. 值得关注的趋势信号

1. **“主权默认”成为隐私敏感场景新标准**  
   NanoClaw（#2003）、CoPaw（#4178）均推动本地语音/模型为默认选项，反映用户对数据控制权的重视上升。

2. **多代理架构从实验走向生产**  
   Zeroclaw v0.8.0、IronClaw Reborn 均完成核心运行时落地，预示 2026 下半年多角色协作将成为主流范式。

3. **CLI 与配置体验成留存关键**  
   多个项目（NanoClaw #2397、LobsterAI #1584）暴露配置混乱问题，**“开箱即用”能力** 正成为社区口碑分水岭。

4. **MCP 生态兼容性决定工具链价值**  
   LobsterAI、CoPaw 均优先修复 MCP 相关问题，表明 **Model Context Protocol 已成为智能体互操作事实标准**。

> **对开发者的建议**：优先选择具备清晰配置抽象、活跃安全响应、多代理支持的项目；在隐私场景默认评估 NanoClaw 或 OpenClaw 的本地部署方案；关注 MCP 兼容性以保障未来扩展性。

---  
**分析师备注**：生态整体向工程严谨性演进，OpenClaw 暂居领先地位，但 Zeroclaw 与 NanoClaw 在细分领域具备颠覆潜力。建议持续监控多代理架构落地效果与 crates.io 发布同步问题（IronClaw #3259）。

---

## 同赛道项目详细报告

<details>
<summary><strong>NanoBot</strong> — <a href="https://github.com/HKUDS/nanobot">HKUDS/nanobot</a></summary>

# NanoBot 项目动态日报（2026-05-11）

---

## 1. 今日速览

NanoBot 社区活跃度保持稳定，过去24小时内共产生 **5条 Issues 更新** 和 **6条 PR 更新**，涵盖功能增强、Bug修复与架构优化。尽管无新版本发布，但核心开发者持续推进关键改进：包括工具系统重构、本地语音转录支持以及智能体自纠正机制引入。社区反馈集中在配置透明性与上下文稳定性问题上，反映出用户对生产环境可靠性的高度关注。

---

## 2. 版本发布

*（无新版本发布）*

---

## 3. 项目进展

今日有 **2个重要 PR 被合并/关闭**，显著提升了系统健壮性与扩展能力：

- **#3711 [已合并]**：将归档对话摘要从运行时上下文移至系统提示词中，解决 KV 缓存频繁失效问题，提升推理效率并降低延迟（[链接](https://github.com/HKUDS/nanobot/pull/3711)）。
- **#3707 [已合并]**：新增 NVIDIA NIM 提供商支持，扩展了模型接入生态，满足企业级用户对高性能推理服务的需求（[链接](https://github.com/HKUDS/nanobot/pull/3707)）。

此外，**#3729** 提出的工具插件化架构重构（将硬编码工具注册改为自描述插件模式）仍处于开放状态，若通过评审将极大提升第三方工具集成效率。

---

## 4. 社区热点

**最活跃 Issue：#3637 “Transcription Provider Configuration Is Not Transparent Enough”**  
该 Issue 在过去24小时内获得 **3条评论**，聚焦 Groq 语音转录配置路径不清晰导致无效设置的问题。用户指出当同时指定 `transcriptionProvider: "groq"` 和 `apiBase` 时，系统未能正确解析端点，易引发运行时错误。  
相关 PR **#3663** 已提出修复方案：统一处理 OpenAI/Groq 的 API Base 格式，兼容 chat-style 与完整转录 URL。此问题直接影响多模态交互体验，是当前语音功能落地的关键阻塞点（[Issue链接](https://github.com/HKUDS/nanobot/issues/3637) | [PR链接](https://github.com/HKUDS/nanobot/pull/3663)）。

---

## 5. Bug 与稳定性

按严重程度排序如下：

| 严重程度 | Issue | 描述 | 是否有 Fix PR |
|--------|------|------|-------------|
| ⚠️ 高 | #3726 | 上下文压缩逻辑异常导致系统无法运行，日志显示 token 合并失败 | ❌ 无 |
| ⚠️ 高 | #2829 | Ollama 工具调用失效，模型无法执行如文件查询等操作，疑似工具格式转发错误 | ❌ 无 |
| ⚠️ 中 | #3469 | DeepSeek-v4 在多轮思考时因 `reasoning_content` 未正确回传而报错 | ❌ 无（已关闭但未说明原因） |

> 注：#3469 虽标记为 CLOSED，但无明确修复说明，建议维护者补充关闭理由以防回归。

---

## 6. 功能请求与路线图信号

用户明确提出以下新功能需求，部分已有对应 PR 推进：

- **本地语音转录支持**：PR #3723 引入基于 `faster-whisper` 的本地转录方案，摆脱对云 API 依赖，适合隐私敏感场景（[链接](https://github.com/HKUDS/nanobot/pull/3723)）。
- **智能体自纠正机制**：PR #3728 提出 `LoopDetectHook` 与 `ReflectRetryHook`，用于检测工具循环调用与盲目重试，提升长任务稳定性（[链接](https://github.com/HKUDS/nanobot/pull/3728)）。
- **动态认知姿态**：Issue #3724 用户呼吁打破固定系统提示词/工具集/知识库的限制，实现任务自适应行为演化——此需求虽抽象，但可能推动未来“元认知层”设计。

上述功能若落地，将显著增强 NanoBot 在复杂、长周期任务中的自主性与鲁棒性。

---

## 7. 用户反馈摘要

- **正面反馈**：用户 @wenge6090-cell 高度认可 NanoBot 的极简架构作为项目基座，并表达敬意（#3724），体现其在二次开发社区中的良好口碑。
- **核心痛点**：
  - 配置项缺乏文档与校验机制，导致“看似合理”的配置实际无效（#3637）；
  - 上下文管理不稳定，压缩逻辑偶发崩溃，影响服务可用性（#3726）；
  - 多模态能力（如语音、工具调用）在不同提供商间表现不一致，增加调试成本（#2829, #3637）。
- **使用场景**：涵盖 QQ 频道聊天机器人、本地开发助手、企业级 AI 代理等，对离线能力与稳定性要求较高。

---

## 8. 待处理积压

以下重要 Issue 长期未获响应，建议维护者优先关注：

- **#2829 “Ollama tool calling broken”**（创建于 2026-04-05，距今超35天）：影响主流开源模型接入能力，阻碍本地部署用户正常使用工具功能（[链接](https://github.com/HKUDS/nanobot/issues/2829)）。
- **#3726 “上下文压缩bug”**（今日新建）：虽为新 Issue，但涉及系统核心稳定性，需紧急排查是否与近期内存优化相关改动有关（[链接](https://github.com/HKUDS/nanobot/issues/3726)）。

> 建议：对 #2829 进行根因分析并发布临时规避指南；对 #3726 启动 hotfix 流程。

---  
*数据来源：GitHub HKUDS/nanobot 仓库，统计周期：2026-05-10 00:00 至 2026-05-11 00:00 UTC*

</details>

<details>
<summary><strong>Zeroclaw</strong> — <a href="https://github.com/zeroclaw-labs/zeroclaw">zeroclaw-labs/zeroclaw</a></summary>

# Zeroclaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

过去24小时内，Zeroclaw 社区保持高活跃度，共产生 **21条 Issues 更新**（16条新开/活跃，5条关闭）和 **29条 PR 更新**（19条待合并，10条已合并/关闭），显示出持续的开发迭代与问题响应节奏。尽管无新版本发布，但多个高风险 Bug 修复和 v0.8.0 多代理运行时相关功能正在积极推进。项目整体处于 **高强度维护与架构演进并行** 的状态，尤其在配置迁移、通道稳定性、提供者兼容性等核心模块集中投入资源。

---

## 2. 版本发布

**无新版本发布**。当前主线仍为 v0.7.x 系列，v0.8.0 功能通过 `integration/v0.8.0` 分支集成中（见 PR #6398），尚未进入稳定发布阶段。

---

## 3. 项目进展

今日有 **10个 PR 被合并或关闭**，关键进展包括：

- **多代理运行时架构落地**：PR #6545（已关闭）完成了 V3 多代理运行时的端到端实现，支持每个 `[agents.<alias>]` 拥有独立工作区、身份与权限控制，标志着项目向多租户/多角色协作迈出关键一步（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/6545)）。
- **配置系统重大升级**：PR #6523（已关闭）引入 v0.8.0 配置 schema 的镜像环境变量语法，彻底清除遗留覆盖机制，为后续配置一致性奠定基础（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/6523)）。
- **SOP 引擎修复**：PR #6534（已关闭）修复了 SopEngine 构造后未调用 `reload()` 导致 SOP 从未加载的关键缺陷（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/6534)）。
- **配置路径隔离增强**：PR #6533（已关闭）确保所有路径字段默认值尊重 `ZEROCLAW_CONFIG_DIR`，解决多实例部署下的配置污染问题（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/6533)）。

> 整体来看，项目正从单一代理模型向 **可组合、可隔离的多代理架构** 演进，同时强化配置与安全的边界控制。

---

## 4. 社区热点

以下 Issues/PRs 引发较高关注：

- **#6530**：Matrix 通道构建失败（recursion limit overflow），影响使用 `channel-matrix` 特性的用户，已获 4 条评论，维护者标记为 `accepted`，需紧急处理依赖兼容性问题（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/6530)）。
- **#6207**（已关闭）：WebSocket 网关绕过 ApprovalManager，导致监督模式下审批提示不显示，属高危安全/UX 缺陷，已修复（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/6207)）。
- **#6034**：用户消息丢失问题（单轮/多轮对话均出现），被标记为 S1 严重性，反映核心对话流可靠性风险，仍在调查中（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/6034)）。
- **PR #6398**：v0.8.0 集成分支，涵盖 schema 迁移、多代理、通道重构等大规模变更，是未来版本的核心载体（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/6398)）。

> 社区诉求集中于 **稳定性保障**（如消息丢失、构建失败）与 **高级功能可用性**（如多代理、SearXNG 支持）。

---

## 5. Bug 与稳定性

按严重程度排序：

| 严重性 | Issue | 描述 | 是否有 Fix PR |
|--------|-------|------|----------------|
| **S0** | #6558 | Qwen 提供者返回 405 Method Not Allowed，导致数据/功能不可用 | ❌ 无 |
| **S0** | #5605（已关闭） | 多实例部署下硬编码配置路径引发冲突 | ✅ PR #6533 |
| **S1** | #6034 | 对话中 user message 丢失，工作流阻塞 | ❌ 调查中 |
| **S1** | #6551 | 非首条 system message 发送至 OpenAI 兼容端点导致拒绝 | ✅ PR #6552 |
| **S1** | #6207（已关闭） | WebSocket 网关绕过审批管理器 | ✅ 已修复 |
| **S2** | #6530 | Matrix SDK v0.16.0 构建递归溢出 | ❌ 需依赖升级 |
| **S2** | #6520 | Gemini CLI 提供者参数语法过时（--print vs --prompt） | ❌ 需适配 |
| **S2** | #6556 | Discord 通道媒体收发全面失效（ inbound 空附件，outbound 标记泄漏） | ❌ 高优先级 |

> 当前存在 **3 个 S1+ 未修复 Bug**，建议优先处理 #6034（消息丢失）与 #6556（Discord 媒体）。

---

## 6. 功能请求与路线图信号

用户提出的新需求中，以下具备较高纳入可能性：

- **#5316**：请求集成 SearXNG 搜索并增强 Web 搜索鲁棒性（含 CAPTCHA 检测）。该需求已被标记 `needs-maintainer-review`，且符合隐私优先趋势，有望纳入 v0.8.1（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/5316)）。
- **#6563**：提议将 ComfyUI/Comfy Cloud 作为共享媒体生成提供者，支持图像与未来视频生成。此提议扩展了 multimodal 能力边界，与现有 image gen 工具链（如 PR #6555）形成协同（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/6563)）。
- **#6272** & **#6271**：多代理运行时配套功能（独立工作区、SwarmConfig V3 schema）已在 PR #6398 和 #6545 中实现，预示 v0.8.0 将正式支持多代理协作范式。

> 路线图清晰指向 **多代理架构** 与 **增强型工具生态**（搜索、媒体生成）。

---

## 7. 用户反馈摘要

从 Issues 评论提炼真实声音：

- **痛点**：
  - “Docker 构建 matrix 通道总是失败，回退到 v0.15.0 才可用” —— 反映依赖管理脆弱性（#6530）。
  - “多实例部署时配置互相覆盖，必须手动指定每个路径” —— 突显配置隔离不足（#5605）。
  - “Discord 发图片 agent 完全看不到，调试半天发现是通道问题” —— 媒体通道可靠性差（#6556）。

- **满意点**：
  - “v0.7.5 的审批流程终于正常了，之前 web UI 完全没提示” —— 安全 UX 改进获认可（#6207 关闭后反馈）。
  - “NixOS 模块让部署变得极其简单” —— 基础设施即代码支持受好评（PR #6562）。

---

## 8. 待处理积压

以下重要 Issue/PR 长期未响应，需维护者关注：

- **#6074**（42天未更新）：审计 153 个被误 revert 的提交，涉及潜在功能/修复丢失，标记为 `in-progress` 但无实质进展（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/6074)）。
- **#5863**（23天未更新）：请求编写“技能开发文档”，标记为 `good first issue` 但无维护者认领，影响新手贡献意愿（[链接](https://github.com/zeroclaw-labs/zeroclaw/issues/5863)）。
- **PR #5254**（38天 open）：修复 llama.cpp Gemma4 工具 schema 校验失败，属提供者兼容性关键修复，尚未合并（[链接](https://github.com/zeroclaw-labs/zeroclaw/pull/5254)）。

> 建议对 #6074 制定恢复计划，并对 #5863 分配文档任务以降低贡献门槛。

--- 

**总结**：Zeroclaw 正处于架构升级关键期，v0.8.0 多代理运行时逐步成型，但需警惕核心稳定性问题（消息丢失、媒体通道）对用户体验的冲击。社区活跃度健康，维护者应优先闭环高严重性 Bug 并推进文档建设。

</details>

<details>
<summary><strong>PicoClaw</strong> — <a href="https://github.com/sipeed/picoclaw">sipeed/picoclaw</a></summary>

# PicoClaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

过去24小时内，PicoClaw 社区活跃度保持稳定，共产生 **4条新 Issue** 和 **5条新 PR**，无已合并或关闭的 PR，表明开发节奏处于“问题收集与修复准备”阶段。项目发布了一个 nightly 构建版本（v0.2.8-nightly.20260511），反映持续集成流程正常运行。当前存在多个高优先级 Bug 报告（如 PID 检查逻辑缺陷、Codex 流式响应异常），需尽快响应以保障系统稳定性。

---

## 2. 版本发布

✅ **Nightly Build v0.2.8-nightly.20260511.6e6293e5 已发布**  
此为自动化 nightly 构建，基于 main 分支最新提交生成，**不推荐用于生产环境**。  
- **更新内容**：包含自 v0.2.8 以来所有未发布的功能与修复，涵盖会话时间戳增强、Telegram Business 模式支持、媒体存储一致性修复等。  
- **破坏性变更**：无明确破坏性变更说明，但 nightly 版本可能存在未验证的回归风险。  
- **迁移建议**：仅建议开发者和测试用户在隔离环境中试用，并通过 [Full Changelog](https://github.com/sipeed/picoclaw/compare/v0.2.8...main) 跟踪具体变更。

---

## 3. 项目进展

⚠️ **今日无 PR 被合并或关闭**，所有 5 条 PR 仍处于开放状态，表明核心维护团队尚未完成代码审查与集成。  
尽管如此，以下 PR 显示出积极的技术推进方向：  
- [`#2750`](https://github.com/sipeed/picoclaw/pull/2750)：修复 Bash 工具中相对路径被误判为绝对路径的问题，直接响应 Issue #2749，逻辑清晰且修复方案成熟。  
- [`#2783`](https://github.com/sipeed/picoclaw/pull/2783)：解决网关重载后媒体存储不一致问题，提升多通道媒体引用可靠性。  
- [`#2845`](https://github.com/sipeed/picoclaw/pull/2845)：新增 Telegram Business 模式支持，扩展了主流商业场景覆盖能力。

> 项目整体处于“功能完善与稳定性加固”阶段，待关键 Bug 修复合并后将显著提升生产可用性。

---

## 4. 社区热点

🔥 **最活跃 Issue：[#2225] Ollama Cloud 凭证支持请求**  
- **评论数**：11 条（过去24小时更新）  
- **链接**：https://github.com/sipeed/picoclaw/issues/2225  
- **分析**：用户强烈呼吁为 Ollama Cloud 提供身份凭证配置选项，反映 PicoClaw 在私有化/云托管 LLM 部署场景中的集成需求增长。该 Issue 已标记 `stale`，但持续有用户追问，说明需求真实且迫切。

💬 **高关注度 Bug：[#2674] Codex OAuth 返回空响应**  
- **👍 点赞数**：3，评论数：3  
- **链接**：https://github.com/sipeed/picoclaw/issues/2674  
- **分析**：当使用 OpenAI Codex OAuth 对接 ChatGPT 后端时，流式响应被错误处理为空，导致用户体验中断。已有对应修复 PR [`#2462`](https://github.com/sipeed/picoclaw/pull/2462) 待合并，社区期待尽快解决。

---

## 5. Bug 与稳定性

按严重程度排序：

| 严重程度 | Issue | 描述 | 是否有 Fix PR |
|--------|------|------|-------------|
| 🔴 高 | [#2720] Singleton PID 检查缺陷 | 网关启动时若 PID 文件中的进程 ID 被系统重用（如 systemd-resolved），会导致误判并陷入崩溃循环 | ❌ 无 |
| 🔴 高 | [#2674] Codex 流式响应为空 | ChatGPT 后端流式输出被错误处理，返回空 assistant 消息 | ✅ 有（[#2462]） |
| 🟠 中 | [#2749] Bash 工具路径解析错误 | 相对路径（如 `archive/SKILL.md`）被误识别为绝对路径，触发安全限制 | ✅ 有（[#2750]） |

> 建议优先处理 #2720，因其可能导致服务完全不可用，且尚无修复方案。

---

## 6. 功能请求与路线图信号

从近期 Issues 与 PR 可识别以下潜在路线图方向：

- **云服务商集成深化**：Ollama Cloud 凭证支持（#2225）代表对主流 LLM 托管平台的原生集成需求上升，可能纳入 v0.3.0 路线图。
- **企业级通信支持**：Telegram Business 模式（[#2845]）表明项目正从个人助手向企业协作场景拓展。
- **会话可观测性增强**：每消息时间戳功能（[#2788]）提升前端展示精度，符合用户对审计与回溯的需求趋势。

> 上述功能均有对应 PR，技术实现较完整，**极有可能在下一个稳定版（v0.2.9 或 v0.3.0）中发布**。

---

## 7. 用户反馈摘要

从 Issue 评论中提炼关键用户声音：

- **痛点**：
  - “没有 Ollama Cloud 凭证选项，我无法在生产环境部署。”（#2225）
  - “Codex 返回空响应，完全无法使用 ChatGPT 后端。”（#2674）
  - “Docker 环境下 PID 冲突导致服务反复崩溃。”（#2720）

- **使用场景**：
  - 私有部署于 Termux（Android）、Docker、Ubuntu 服务器；
  - 多通道接入（Discord、Telegram、OneBot）；
  - 结合 Llama.cpp、GLM-4.7-Flash 等本地/远程模型。

- **满意度**：
  - 用户认可 PicoClaw 的多协议适配能力与轻量级架构；
  - 对 nightly 构建的及时性表示满意，但呼吁更快合并关键修复。

---

## 8. 待处理积压

⚠️ **需维护者重点关注的长周期未响应项**：

- [`#2225`] Ollama Cloud 凭证支持（创建于 2026-03-31，已标记 `stale`，但需求强烈）  
  → 建议评估是否纳入 provider 抽象层扩展计划。

- [`#2462`] Codex 流式输出与 Telegram 重试修复（创建于 2026-04-09，长期 open）  
  → 已有详细测试场景描述，建议优先 review 并合并。

- [`#2720`] PID 检查逻辑缺陷（高优先级 Bug，无对应 PR）  
  → 需设计跨进程身份验证机制（如进程名/启动参数校验），避免误杀。

> 建议维护团队在本周内对上述三项进行状态更新或分配负责人，以改善社区信任度与项目健康度。

---  
*数据来源：GitHub Repository sipeed/picoclaw，统计截止 2026-05-11 00:00 UTC*

</details>

<details>
<summary><strong>NanoClaw</strong> — <a href="https://github.com/qwibitai/nanoclaw">qwibitai/nanoclaw</a></summary>

# NanoClaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

NanoClaw 社区活跃度持续高位运行，过去24小时内共产生 **19条 Issues 更新**（17条新开/活跃，2条关闭）和 **21条 PR 更新**（10条待合并，11条已合并/关闭），显示出强劲的开发与问题反馈节奏。尽管无新版本发布，但核心模块（如 poll-loop、CLI、容器调度、安全边界）正经历密集修复与功能增强。项目整体处于**高迭代、高响应**的健康状态，维护团队对关键问题（如消息重复投递、容器镜像陈旧、CLI 权限控制）反应迅速，多个 PR 在同日内完成闭环。

---

## 2. 版本发布

**无新版本发布**。当前最新稳定版本仍为 v2.0.54（见 Issue #2401），团队正集中处理基础设施稳定性与 CLI 工具链缺陷，预计下一版本将聚焦于容器生命周期管理与调度系统改进。

---

## 3. 项目进展

今日共 **11个 PR 被合并或关闭**，推动多项关键修复落地：

- **安全加固**：[#2392](https://github.com/nanocoai/nanoclaw/pull/2392) 实现 `cli-scope` 的 fail-closed 机制，防止越权访问会话资源；[#2383](https://github.com/nanocoai/nanoclaw/pull/2383) 引入 `create_agent` 动作的授权检查，强化 agent-to-agent 边界。
- **容器稳定性**：[#2399](https://github.com/nanocoai/nanoclaw/pull/2399) 修复 Claude 二进制路径解析问题，避免首次消息失败；[#2374](https://github.com/nanocoai/nanoclaw/pull/2374) 解决 amplifier-remote 提供者中的静默挂起 bug，恢复 Signal 通道可靠性。
- **CLI 与配置体验**：[#2356](https://github.com/nanocoai/nanoclaw/pull/2356) 在升级时自动创建 `~/.local/bin/ncl` 符号链接，提升用户体验；[#2400](https://github.com/nanocoai/nanoclaw/pull/2400) 更新 CONTRIBUTING.md 中的仓库引用，引导新贡献者至正确地址。
- **网络与代理兼容**：[#2330](https://github.com/nanocoai/nanoclaw/pull/2330) 修复 axios-based MCP 服务器通过 OneCLI 网关的代理通信问题。

这些合并显著提升了系统的**安全性、稳定性和可维护性**，尤其在多通道集成与容器隔离方面迈出关键步伐。

---

## 4. 社区热点

### 🔥 高关注度 Issue：消息重复投递（#2404）
> [Double delivery when agent uses send_message MCP tool and <message> blocks in the same turn](https://github.com/nanocoai/nanoclaw/issues/2404)  
**作者**：@mshirel | **评论数**：1 | **状态**：Open  

该问题揭示了 poll-loop 中 MCP 工具输出与 `<message>` 标签解析路径的**逻辑冲突**：当 agent 同时调用 `send_message` 工具并包裹相同内容于 `<message>` 块时，消息会被投递两次。根本原因在于 `StdioServerTransport` 作为独立子进程运行，导致两条输出路径未去重。此问题直接影响用户体验，已有开发者开始分析代码路径，预计将成为下个热修重点。

### 📌 其他高价值讨论：
- **#2398**：[Recurring task catch-up policy is implicit and not configurable](https://github.com/nanocoai/nanoclaw/issues/2398) —— 用户呼吁为周期性任务提供显式追赶策略配置，反映调度模块需增强灵活性。
- **#2397**：[No top-level ncl CLI for scheduled tasks](https://github.com/nanocoai/nanoclaw/issues/2397) —— 暴露 CLI 工具链对任务管理支持不足，亟需统一控制接口。

---

## 5. Bug 与稳定性

| 严重程度 | Issue | 描述 | 是否有 Fix PR |
|--------|------|------|-------------|
| ⚠️ **高** | #2404 | 消息重复投递（MCP + `<message>` 双重输出） | ❌ 无（待修复） |
| ⚠️ **高** | #2381 | `/update-nanoclaw` 导致容器崩溃（依赖不一致） | ❌ 无 |
| ⚠️ **高** | #2380 | 沙箱容器启动失败：`/app/src` 未挂载 | ❌ 无 |
| ⚠️ **中** | #2401 | `pnpm run chat` 因 MITM 连接错误超时 | ❌ 无 |
| ⚠️ **中** | #2377 | Telegram 在 IPv6 故障主机上验证失败 | ❌ 无 |
| ✅ **已修复** | #2374 | amplifier-remote 静默挂起 | ✅ [#2374](https://github.com/nanocoai/nanoclaw/pull/2374) |

> **趋势分析**：容器生命周期管理（镜像构建、挂载、依赖同步）成为当前主要故障源，建议优先投入资源建立自动化重建触发机制。

---

## 6. 功能请求与路线图信号

以下功能请求已获得初步实现或强烈社区共鸣，**极可能被纳入下一版本**：

- **语音转录 V2（主权优先）**：PR [#2003](https://github.com/nanocoai/nanoclaw/pull/2003) 持续推进，主张“容器内默认本地 whisper.cpp + 可选云回退”，契合项目 sovereignty 理念。
- **Groq Whisper 后端支持**：Issue [#2396](https://github.com/nanocoai/nanoclaw/issues/2396) 提议添加 Groq 作为 opt-in 云后端，扩展语音处理能力。
- **CLI 任务管理命令**：Issue [#2397](https://github.com/nanocoai/nanoclaw/issues/2397) 呼吁提供 `ncl tasks list/run-now/pause` 等命令，填补调度系统 CLI 空白。
- **挂载白名单初始化工具**：Issue [#2388](https://github.com/nanocoai/nanoclaw/issues/2388) 建议增加 `bin/ncl mounts init` 命令，降低新用户上手门槛。

此外，**per-message reasoning-effort 路由**（PR [#2406](https://github.com/nanocoai/nanoclaw/pull/2406)）和 **消息 compaction 后 unwrapped 输出投递修复**（PR [#2405](https://github.com/nanocoai/nanoclaw/pull/2405)）已进入开发阶段，预示 poll-loop 智能化调度将成为下一阶段重点。

---

## 7. 用户反馈摘要

从 Issues 中提炼的真实用户痛点：

- **安装与权限焦虑**：@b1ek（#2385）反映“必须创建 VM 才能安全运行”，暴露项目对 root 权限的依赖引发信任危机，呼吁 rootless 安装方案。
- **CLI 行为不一致**：多名用户（#2390、#2386、#2389）指出 `bin/ncl groups create` 忽略 `--id`、生成非法 UUID、不自动创建 destinations，导致消息静默丢弃，**破坏基本工作流**。
- **文档与引导缺失**：新用户不知 `mount-allowlist.json` 路径（#2388），贡献者误 clone 旧仓库（#2400），说明 onboarding 流程需优化。
- **跨平台兼容性**：Windows/WSL2 用户遭遇 MITM 错误（#2401），Linux IPv6 配置问题影响 Telegram 集成（#2377），凸显网络栈适配不足。

> **满意度亮点**：用户对“主权默认”设计（如 #2003）表示认可，认为其平衡了隐私与功能。

---

## 8. 待处理积压

以下重要 Issue 长期未响应，**建议维护者优先处理**：

- **#2378 / #2379**（容器镜像陈旧导致基础设施不稳定）—— 已标记为“recurring pattern”，但无系统性解决方案，仅靠临时重启无法根治。
- **#2393**（Claude 省略 `</message>` 导致响应静默丢弃）—— 影响核心消息传递可靠性，需增强 parser 容错性。
- **#2387**（`wirings update` 不支持修改 `--agent-group-id`）—— 阻碍用户动态重路由通道，当前只能 delete+create，体验割裂。

> **提醒**：上述问题均涉及核心工作流，延迟处理可能引发用户流失。建议设立专项 sprint 解决容器生命周期与 CLI 一致性缺陷。

--- 

**报告生成时间**：2026-05-11  
**数据来源**：[NanoClaw GitHub Repository](https://github.com/nanocoai/nanoclaw)

</details>

<details>
<summary><strong>IronClaw</strong> — <a href="https://github.com/nearai/ironclaw">nearai/ironclaw</a></summary>

# IronClaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

IronClaw 项目在2026年5月10日至11日期间保持**高活跃度开发节奏**，核心团队持续推进 Reborn 架构重构。过去24小时内共处理 **28条 PR 更新**（12条已合并/关闭，16条待合并）和 **8条 Issues 更新**（6条新开/活跃，2条已关闭），显示出强烈的内部迭代与工程化投入。尽管无新版本发布，但多个关键模块（如 `TurnRunnerWorker`、`LoopExitApplier`、配置边界解耦）已完成实现并合并，标志着 Reborn 子系统的基础设施逐步成型。社区层面出现对 crates.io 版本滞后的担忧，反映出下游依赖管理的现实压力。

---

## 2. 版本发布

**无新版本发布**。  
最新 GitHub 标签为 `ironclaw-v0.27.0`（2026-04-29），但 crates.io 上最新版本仍为 `0.24.0`（2026-03-31），存在显著发布延迟（见 Issue #3259）。

---

## 3. 项目进展

今日有 **12个 PR 被合并或关闭**，主要集中在 Reborn 架构的底层能力建设：

- ✅ **Reborn 核心运行时增强**：  
  - [`#3457`](https://github.com/nearai/ironclaw/pull/3457) 合并了完整的 `TurnRunnerWorker` 实现，支持单任务领取、租约机制与心跳保活，为分布式任务调度奠定基础。  
  - [`#3460`](https://github.com/nearai/ironclaw/pull/3460) 引入 `LoopExitApplier`，将退出策略验证与应用逻辑解耦，提升运行时安全性。  
  - [`#3454`](https://github.com/nearai/ironclaw/pull/3454) 添加 `AgentLoopDriverHost` 能力端口适配器，打通 Reborn 循环驱动与宿主运行时的集成路径。

- ✅ **配置与架构解耦**：  
  - [`#3458`](https://github.com/nearai/ironclaw/pull/3458) 提取独立配置 crate `ironclaw_reborn_config`，实现启动配置与 CLI 的边界隔离，符合模块化设计原则。  
  - [`#3455`](https://github.com/nearai/ironclaw/pull/3455) 创建 standalone CLI 二进制 crate，为 Reborn 提供独立入口，避免与 v1 主程序耦合。

- ✅ **类型安全与测试覆盖**：  
  - [`#3453`](https://github.com/nearai/ironclaw/pull/3453) 将字符串类型的 `run_id`/`turn_id` 替换为强类型 ID，减少运行时错误（对应 Issue #3452）。  
  - [`#3442`](https://github.com/nearai/ironclaw/pull/3442) 完成 LoopExit 合约全部 22 项验收标准验证，并补充 7 项缺口测试，显著提升合约可靠性。

> 整体来看，Reborn 架构已从设计阶段进入**工程落地深水区**，核心组件逐步就位。

---

## 4. 社区热点

- **🔥 Issue #3259: [Publish 0.25.0–0.27.0 to crates.io](https://github.com/nearai/ironclaw/issues/3259)**  
  用户 @dacoldest 指出：GitHub 已有 `v0.27.0` 标签，但 crates.io 仍停留在 `v0.24.0`，导致下游项目因 wasmtime 28.x 的 CVE 被强制锁定旧版本。此问题已引发关注，反映**发布流程自动化不足**，可能影响生态信任度。

- **🔧 PR #3416: [refactor(llm): hide provider-specific auth behind facades](https://github.com/nearai/ironclaw/pull/3416)**  
  大规模重构 PR（XL 规模），旨在封装 LLM 提供商的认证、模型获取与嵌入配置细节，防止内部实现泄漏。虽无评论，但其高风险标签（`risk: high`）和跨多 scope 修改表明这是架构治理的关键一步。

---

## 5. Bug 与稳定性

| 严重程度 | Issue | 描述 | 状态 |
|--------|------|------|------|
| **P1** | [#2752](https://github.com/nearai/ironclaw/issues/2752) | `ironclaw onboard` 命令在 provider 步骤抛出数据库错误 | 🔴 未修复，长期未响应（自 2026-04-20 起） |
| **Medium** | [#3447](https://github.com/nearai/ironclaw/issues/3447) | Nightly E2E 测试失败（v2-engine） | 🟡 自动上报，需排查 CI 环境或代码回归 |
| **Low** | [#2169](https://github.com/nearai/ironclaw/pull/2169) | WASM 工具 schema 中 nullish 参数处理异常 | ✅ 已关闭（PR 已合并且修复） |

> 注：#2752 虽标记为 `bug_bash_P1`，但近三周无维护者回应，存在**响应延迟风险**。

---

## 6. 功能请求与路线图信号

- **用户可配置模型路由**：Issue [#3459](https://github.com/nearai/ironclaw/issues/3459) 提出允许本地用户直接选择 provider+model 组合，避免暴露内部术语。该需求与 Reborn 的“用户友好配置”目标一致，且已有相关 PR（如 #3410、#3429）铺垫，**极可能被纳入下一阶段开发**。
- **DB 层性能优化**：Issue [#3451](https://github.com/nearai/ironclaw/issues/3451) 指出 `LoopCheckpointStore` 存在过度 hydration 问题，建议直接操作 DB 映射。此优化诉求明确，且与维护者推动的“高效持久化”方向契合，**有望在 Reborn 存储层迭代中解决**。

---

## 7. 用户反馈摘要

- **痛点**：  
  - 下游开发者因 crates.io 版本滞后无法获取安全更新，被迫锁定含 CVE 的旧依赖（#3259）。  
  - 本地部署时 `onboard` 流程因数据库配置问题中断，缺乏清晰错误指引（#2752）。
- **满意点**：  
  - 社区认可 Reborn 架构的类型安全改进（如 #3453 的强类型 ID），认为“减少了运行时 panic 风险”。  
  - 多租户隔离修复（PR #3390）被内部测试团队验证有效，“SSE/WS 事件泄漏问题彻底解决”。

---

## 8. 待处理积压

| Issue/PR | 标题 | 积压时长 | 风险提示 |
|--------|------|--------|--------|
| [#2752](https://github.com/nearai/ironclaw/issues/2752) | onboard 命令 DB 错误 | **21天** | P1 Bug，影响新用户上手体验，需优先排查 |
| [#3259](https://github.com/nearai/ironclaw/issues/3259) | crates.io 版本未同步 | **16天** | 生态信任危机，建议建立自动发布流水线 |
| [#3381](https://github.com/nearai/ironclaw/pull/3381) | Telegram OAuth 恢复逻辑 | 待合并（4天） | 高价值 UX 修复，涉及多通道认证流，建议加速 review |

> 建议维护团队本周内响应 #2752 并制定 crates.io 发布计划，以维护项目健康度与社区信心。

---  
*数据来源：IronClaw GitHub 仓库（2026-05-10 至 2026-05-11）*

</details>

<details>
<summary><strong>LobsterAI</strong> — <a href="https://github.com/netease-youdao/LobsterAI">netease-youdao/LobsterAI</a></summary>

# LobsterAI 项目动态日报（2026-05-11）

---

## 1. 今日速览

过去24小时内，LobsterAI 项目整体活跃度**中等偏低**，无新版本发布，但代码层面积极推进修复与优化。共关闭 1 个 Issue 和 1 个 PR，另有 15 个 PR 仍处于待合并状态，主要集中在 `cowork`、`scheduled-task`、`openclaw` 等核心模块的稳定性修复。社区对 MCP（Model Context Protocol）功能在打包后失效的问题持续关注，相关 Issue 虽已关闭，但暴露出构建流程与运行时环境差异的隐患。项目当前处于**密集修复期**，技术债务清理为主，新功能推进暂缓。

---

## 2. 版本发布

**无新版本发布**。  
上一个可用版本仍为 `2026.3.25-beta`，团队正集中修复多个关键缺陷，预计下一版本将包含本次日报中提及的多项稳定性改进。

---

## 3. 项目进展

✅ **已合并/关闭的重要 PR**：

- **#857 [CLOSED]** feat: 新增MCP对http streaming的支持  
  [🔗 PR #857](https://github.com/netease-youdao/LobsterAI/pull/857)  
  由社区贡献者 @noobdawn 提交，为 MCP 协议增加了对 HTTP Streaming 的支持，提升了与 BrainMaker 等外部工具的集成能力。尽管 SSE 测试尚未完成，该功能填补了 MCP 在流式响应场景下的空白，增强了 LobsterAI 作为 AI 助手的上下文交互能力。

> 📌 项目整体向“更稳定的多引擎协作”迈出关键一步，尤其在 MCP 生态兼容性上取得进展。

---

## 4. 社区热点

🔥 **高关注度 Issue**：

- **#820 [CLOSED]** dev阶段MCP可用；打包后，MCP不可用  
  [🔗 Issue #820](https://github.com/netease-youdao/LobsterAI/issues/820)  
  用户 @noobdawn 报告：在开发环境下 MCP 配置正常，但在打包后的正式版本中提示 “0 tools”，无法识别工具调用。该问题在 `2026.3.16-beta.1` 和 `2026.3.25` 中均复现，但本地 clone 测试正常。

  **背后诉求分析**：  
  用户期望 MCP 功能在发布版本中与开发环境行为一致，反映出对**构建流程一致性**和**生产环境可靠性**的高度关注。此问题虽已关闭（可能通过 #857 的 streaming 支持间接缓解），但暴露出打包过程中资源加载、依赖注入或权限配置可能被裁剪的风险，需长期监控。

---

## 5. Bug 与稳定性

⚠️ **待修复关键问题（按严重程度排序）**：

| 严重程度 | 问题描述 | 关联 PR | 状态 |
|--------|--------|--------|------|
| 🔴 高 | OpenClaw 网关因 `skipMissedJobs` 字段无法启动（exit code 1） | #1593 | 🟡 有修复 PR，待合并 |
| 🔴 高 | 定时任务即使配置 IM 通知仍错误提示“未配置通道” | #1588 | 🟡 有修复 PR，待合并 |
| 🟠 中 | Agent ID 基于名称生成导致“数据复活”（删除后重建同名 Agent 复用旧数据） | #1584 | 🟡 有修复 PR，待合并 |
| 🟠 中 | 设置页输入框按 Enter 键意外关闭页面（含 IME 输入法场景） | #1585 | 🟡 有修复 PR，待合并 |
| 🟠 中 | 搜索功能仅限当前 Agent 且无法匹配消息内容 | #1594 | 🟡 有修复 PR，待合并 |
| 🟢 低 | SQLite 迁移失败后仍标记完成，导致无法重试 | #1595 | 🟡 有修复 PR，待合并 |

> 💡 当前积压的 15 个 PR 几乎全部为稳定性修复，表明团队正系统性解决数据一致性、配置同步与用户体验问题。

---

## 6. 功能请求与路线图信号

📌 **潜在纳入下一版本的功能方向**：

- **AI 回复期间连续发送消息（客户端消息队列）**  
  #1590 提出在 AI 流式回复期间允许用户继续输入并排队消息，支持编辑与删除。该功能显著提升多轮对话体验，符合现代 AI 助手交互趋势，**极可能被优先合并**。

- **MCP 流式支持扩展至 SSE**  
  虽然 #857 已实现 HTTP Streaming，但作者注明“SSE 未测试”。结合 #820 的反馈，**SSE 支持将成为 MCP 完整性的关键补全**，预计后续将有跟进 PR。

- **IM 通知通道配置体验优化**  
  多个 PR（#1588、#1600、#1606）围绕定时任务与 IM 集成展开，反映出团队正强化“自动化通知”能力，**企业级消息推送**或成下一阶段重点。

---

## 7. 用户反馈摘要

🗣️ 从 Issues 与 PR 评论中提炼的真实声音：

- **痛点**：  
  > “打包后 MCP 完全不可用，但本地跑起来没问题” —— @noobdawn  
  反映出**开发/生产环境差异**是用户最担心的稳定性问题。

- **使用场景**：  
  用户频繁使用 MCP 连接 BrainMaker 等外部工具，依赖其实现自动化工作流，**对工具链集成稳定性要求高**。

- **满意度**：  
  社区对快速响应修复表示认可（如 #857 被迅速合并），但对“stale”标签长期存在（部分 PR 已挂起超 30 天）略有微词，**期待更高效的代码审查节奏**。

---

## 8. 待处理积压

⏳ **长期未响应的重要 Issue / PR（需维护者关注）**：

| 编号 | 类型 | 标题 | 创建时间 | 状态 | 建议 |
|------|------|------|--------|------|------|
| #1584 | PR | fix(agent): 使用短 UUID 替代名称生成 Agent ID | 2026-04-09 | OPEN (stale) | 🔧 高优先级，解决数据污染问题 |
| #1590 | PR | feat(cowork): 支持 AI 回复期间连续发送消息 | 2026-04-09 | OPEN (stale) | 🚀 高价值 UX 改进，建议优先 review |
| #1593 | PR | fix(openclaw): remove unrecognized skipMissedJobs field | 2026-04-09 | OPEN (stale) | ⚠️ 阻塞性 Bug，影响网关启动，需紧急处理 |

> 📢 **维护者提醒**：多个关键修复 PR 已标记 `stale` 超过一个月，建议建立定期 triage 机制，避免技术债务累积影响项目可信度。

---

**总结**：LobsterAI 当前处于**深度优化阶段**，虽无新功能发布，但底层稳定性、数据一致性与多引擎协作能力正系统性增强。社区对 MCP 和 IM 集成的期待高涨，建议加快积压 PR 的合并节奏，以提升用户信心与项目健康度。

</details>

<details>
<summary><strong>TinyClaw</strong> — <a href="https://github.com/TinyAGI/tinyclaw">TinyAGI/tinyclaw</a></summary>

过去24小时无活动。

</details>

<details>
<summary><strong>Moltis</strong> — <a href="https://github.com/moltis-org/moltis">moltis-org/moltis</a></summary>

**Moltis 项目动态日报**  
📅 日期：2026-05-11  
🔗 项目主页：[github.com/moltis-org/moltis](https://github.com/moltis-org/moltis)

---

### 1. 今日速览  
过去24小时内，Moltis 项目整体活跃度较低，无新 Pull Request 提交或合并，社区互动趋于平稳。唯一显著动作为一个长期功能请求 Issue #533 被正式关闭，标志着该增强特性已完成评估或实现闭环。同时，项目发布了一个新版本 `20260510.01`，表明开发团队持续推进迭代。综合来看，项目处于稳定维护与版本发布节奏中，社区参与度温和，技术债务控制良好。

---

### 2. 版本发布  
✅ **新版本 `20260510.01` 已发布**  
- **发布时间**：2026-05-10  
- **版本号**：`20260510.01`  
- **说明**：本次为常规版本更新，未在 Release 描述中披露具体变更内容，推测为内部优化、依赖升级或小规模功能完善。  
- **破坏性变更**：无公开信息表明存在破坏性变更。  
- **迁移建议**：用户可安全升级，建议关注后续 Changelog 或文档更新以获取细节。  
🔗 [Release 20260510.01](https://github.com/moltis-org/moltis/releases/tag/20260510.01)

> ⚠️ 注：当前 Release 页面未提供详细更新日志，建议维护团队补充发布说明以提升透明度。

---

### 3. 项目进展  
过去24小时无 Pull Request 合并或关闭，因此无新功能落地或问题修复通过代码合并实现。项目整体开发节奏放缓，可能处于版本发布后的休整期或功能规划阶段。

---

### 4. 社区热点  
📌 **Issue #533：[CLOSED] “+” button for adding message attachments**  
- **状态**：已关闭（2026-05-10 更新）  
- **评论数**：4 条  
- **点赞数**：0  
- **作者**：@gabevf  
- **摘要**：用户提议在消息界面添加“+”按钮以支持附件上传功能，提升交互直观性。该 Issue 自 2026-03-31 提出，历时约 40 天后关闭，可能意味着功能已实现、被拒绝或纳入后续规划。  
- **分析**：尽管未获高赞，但该请求反映了用户对消息富媒体交互的明确需求。关闭动作本身传递出维护团队对功能请求的响应闭环，有助于提升社区信任。  
🔗 [Issue #533](https://github.com/moltis-org/moltis/issues/533)

---

### 5. Bug 与稳定性  
过去24小时无新 Bug 报告或崩溃问题提交，项目稳定性表现良好，未发现回归或严重缺陷。

---

### 6. 功能请求与路线图信号  
- **已关闭功能请求**：Issue #533（消息附件“+”按钮）的关闭可能暗示该功能已被评估并处理。若结合新版本 `20260510.01` 发布，存在该功能已悄然上线的可能性，建议用户验证体验。  
- **潜在路线图方向**：用户对消息交互增强（如附件、富文本）的关注度上升，未来版本可能继续优化对话界面的可用性与扩展性。

---

### 7. 用户反馈摘要  
从 Issue #533 的评论中可提炼以下用户诉求：  
- **痛点**：当前消息发送流程缺乏直观的附件添加入口，依赖菜单或快捷键，学习成本较高。  
- **使用场景**：用户希望在聊天、协作或客服场景中快速附加文件、图片或文档。  
- **满意度**：虽未明确表达不满，但主动提出改进建议表明用户对产品体验有较高期待。  
- **建议**：未来功能迭代应优先考虑 UI/UX 的直观性与一致性，减少操作路径。

---

### 8. 待处理积压  
经扫描，目前无长期未响应（>30天）且状态为 Open 的重要 Issue 或 PR。Issue #533 已及时关闭，体现维护团队对社区反馈的响应效率。建议继续保持对 Enhancement 类 Issue 的定期 Review，避免功能请求积压。

---

📊 **项目健康度评估**：⭐⭐⭐⭐☆（4/5）  
- 优势：版本发布稳定，Issue 响应及时，无技术债务积压。  
- 改进点：Release 说明透明度不足，建议补充更新日志；可适度增加社区互动激励。

> 报告生成时间：2026-05-11 08:00 UTC  
> 数据来源：GitHub API / Moltis Public Repository

</details>

<details>
<summary><strong>CoPaw</strong> — <a href="https://github.com/agentscope-ai/CoPaw">agentscope-ai/CoPaw</a></summary>

# CoPaw 项目动态日报（2026-05-11）

---

## 1. 今日速览

过去24小时内，CoPaw 社区活跃度显著上升，共产生 **12条 Issues 更新**（11条新开/活跃，1条关闭）和 **10条 PR 更新**（9条待合并，1条已合并/关闭）。尽管无新版本发布，但社区贡献者集中提交了多项功能增强与关键修复，涵盖安全、异步 I/O、模型兼容性及用户体验优化。项目整体处于高响应状态，核心维护者对多个长期问题作出回应，显示出良好的社区协作节奏。

---

## 2. 版本发布

**无新版本发布**。当前最新版本仍为 v1.1.5，建议用户关注即将发布的 v1.2.0 候选版本，预计将整合近期多项安全修复与功能改进。

---

## 3. 项目进展

今日共 **1个 PR 被合并/关闭**，其余9个处于待合并状态，主要由新贡献者推动：

- **#4172 [CLOSED]**：新增 OpenWond Draw 工具插件，支持 GPT Image 2 与 Nano Banana 系列图像生成模型，扩展了多模态能力（[链接](https://github.com/agentscope-ai/QwenPaw/pull/4172)）。
- **#4171 [OPEN]**：引入 Memory Distill 工具插件，采用“标题差分”蒸馏引擎实现智能记忆压缩，噪声过滤率达92%，显著提升长期对话效率（[链接](https://github.com/agentscope-ai/QwenPaw/pull/4171)）。
- **#4169 [OPEN]**：修复火山引擎（VOLCENGINE）Provider 模型连接失败问题，修正 model name 映射并标记多模态模型，提升第三方服务稳定性（[链接](https://github.com/agentscope-ai/QwenPaw/pull/4169)）。

此外，多个由 @soliman10 提交的 PR 正待审核，涉及 **SHA-256 替换 MD5 哈希**（#4180）、**异步文件操作优化**（#4179）、**本地音频支持**（#4178）及 **tag_parser 单元测试增强**（#4177），标志着项目在安全性与可维护性上的持续投入。

---

## 4. 社区热点

### 🔥 高讨论度 Issues

- **#3843 [Bug] Session history disappears and new messages are routed to a different session**  
  评论数：7 | 链接：[GitHub](https://github.com/agentscope-ai/QwenPaw/issues/3843)  
  用户反馈会话历史突然清空，但会话标题仍保留，严重影响对话连续性。此问题自4月26日提出，持续引发关注，可能涉及会话状态管理或前端缓存逻辑缺陷。

- **#578 [Meta] OpenClaw-Inspired Features for Compounding Agent Value**  
  评论数：8 | 链接：[GitHub](https://github.com/agentscope-ai/QwenPaw/issues/578)  
  长期 meta-issue，倡导借鉴 OpenClaw 架构实现“复利式价值增长”，包括记忆增强、工具链协同等。反映用户对长期智能体演进路径的高度期待。

- **#2429 [Question] Cron job interrupted with “I noticed that you have interrupted me”**  
  评论数：6 | 链接：[GitHub](https://github.com/agentscope-ai/QwenPaw/issues/2429)  
  用户在使用定时任务时遭遇异常中断提示，暴露调度机制与交互逻辑的边界处理缺陷，需明确任务执行上下文隔离策略。

---

## 5. Bug 与稳定性

按严重程度排序：

| 严重等级 | Issue | 描述 | 是否有 Fix PR |
|--------|------|------|-------------|
| ⚠️ 高 | #3843 | 会话历史丢失，消息路由错乱 | ❌ 无 |
| ⚠️ 高 | #4170 | 动作执行期间无实时反馈，用户无法中断长时间任务 | ❌ 无 |
| ⚠️ 中 | #4174 | 使用 OpenAI 格式 API 时 agent 思维未折叠，占用大量屏幕空间 | ❌ 无 |
| ⚠️ 中 | #4184 | v1.1.5 使用本地模型时任务中断 | ❌ 无（刚提交） |
| ⚠️ 中 | #4123 | Windows 下 execute_shell_command 每次调用闪出控制台窗口 | ✅ 有（#4173 提供 Unix 修复，Windows 待跟进） |
| ⚠️ 低 | #3718 [CLOSED] | Windows Defender 误报 v1.1.3 为木马 | ✅ 已修复（确认 false positive） |

> 注：#4173 已针对 Unix 平台修复 shell 命令挂起问题，但 Windows 平台类似问题（#4123）尚未完全解决。

---

## 6. 功能请求与路线图信号

以下功能请求具备高采纳潜力，已有相关 PR 或技术铺垫：

- **自动模型故障转移**（#4181）：当 LLM API 失败时自动切换备用模型。该需求契合生产环境稳定性要求，若结合 #4169 的 Provider 修复，可形成完整容错链路。
- **MCP 客户端 TLS 配置支持**（#4175）：支持 `tls_verify` 与 `ca_file`，满足企业内网自签名证书场景，安全性与部署灵活性双提升。
- **本地音频文件支持**（#4178 PR）：已由贡献者实现，预计将纳入下一版本，增强多模态交互能力。
- **默认智能体配置持久化**（#4182）：用户无法通过 config.json 设置默认 agent，暴露配置系统缺陷，亟需修复。

---

## 7. 用户反馈摘要

- **痛点**：
  - 会话状态不稳定（#3843）、任务执行无反馈（#4170）严重影响信任感；
  - 自定义模型 API 请求路径错误（#4183：`cpa/gpt-5.5` 而非 `gpt-5.5`），暴露 provider 拼接逻辑缺陷；
  - 桌面版无法设置默认智能体（#4182），配置不生效，降低个性化体验。

- **满意点**：
  - 新工具插件（如 Memory Distill、OpenWond Draw）获得积极关注，用户认可功能创新；
  - 安全修复（如 MD5 → SHA-256）响应迅速，体现项目对安全性的重视。

- **使用场景**：
  - 企业用户关注 TLS 配置与模型容灾（#4175、#4181）；
  - 开发者依赖本地模型与自定义 API，对兼容性与调试体验敏感（#4183、#4184）。

---

## 8. 待处理积压

以下重要 Issue 长期未获官方响应，建议维护者优先处理：

- **#3843 会话历史丢失**（4月26日提交，7条评论）：影响核心用户体验，需排查会话 ID 映射或前端状态同步机制。
- **#2429 定时任务中断问题**（3月27日提交，6条评论）：涉及任务调度与中断信号处理，需明确设计边界。
- **#578 OpenClaw 架构演进提案**（3月4日提交，8条评论）：虽为 meta-issue，但代表用户对长期架构升级的深度期待，建议纳入 roadmap 讨论。

> 建议：对 #3843 和 #4170 启动专项排查，二者均涉及核心交互流程，修复后可显著提升稳定性评分。

--- 

**报告生成时间**：2026-05-11  
**数据来源**：GitHub CoPaw 仓库 Issues & PRs 活动日志

</details>

<details>
<summary><strong>ZeptoClaw</strong> — <a href="https://github.com/qhkm/zeptoclaw">qhkm/zeptoclaw</a></summary>

**ZeptoClaw 项目动态日报（2026-05-11）**

---

### 1. 今日速览  
ZeptoClaw 项目今日整体活跃度较低，无新 Issue 提交或关闭，亦无新版本发布。唯一显著动作为一个关键架构重构 PR 的开启（#583），标志着 Agent 中间件管道第二阶段集成的正式启动。该 PR 属于 #399 路线图下的核心演进，虽尚未合并，但表明项目仍在持续推进底层架构现代化。社区互动暂歇，开发重心集中于内部模块解耦与流程标准化。

---

### 2. 版本发布  
*（无新版本发布）*

---

### 3. 项目进展  
今日无 PR 被合并或关闭，但 **PR #583** 的提交代表了重要阶段性进展：  
> [refactor(agent): wire Pipeline into process_message + CoreLoop (phase 2 of #399)](https://github.com/qhkm/zeptoclaw/pull/583)  
该 PR 实现了 Agent 中间件管道的第二阶段 scaffolding，将 `Pipeline` 正式接入 `process_message` 与 `CoreLoop` 流程，并新增 `src/agent/core_loop.rs` 模块。此举为后续可插拔中间件、统一上下文传递和异步处理打下基础，是迈向模块化 Agent 架构的关键一步。尽管当前包含 `LegacyTerminal` 占位实现，其结构已支持未来扩展。

---

### 4. 社区热点  
*（今日无活跃讨论或高互动 Issues/PRs）*  
唯一 PR #583 尚无评论或反应（👍: 0），表明社区当前处于观察期，可能等待核心团队进一步验证架构稳定性后再参与反馈。

---

### 5. Bug 与稳定性  
*（今日未报告任何 Bug、崩溃或回归问题）*  
项目当前无公开稳定性风险，但需注意 PR #583 中引入的 `LegacyTerminal` 为临时短路实现，若未来未及时替换，可能成为技术债或导致功能缺失。

---

### 6. 功能请求与路线图信号  
虽无新 Issue 提出功能请求，但 PR #583 明确指向 **#399 路线图** 中的“Agent Middleware Pipeline”目标，暗示下一阶段开发将聚焦于：  
- 中间件链式调用机制  
- 消息处理流程标准化  
- 上下文（`PipelineContext`）跨子系统传递  
这些改进有望提升 AI 助手的可观测性、可测试性与扩展性，符合现代 Agent 框架演进趋势。

---

### 7. 用户反馈摘要  
*（今日无用户评论或 Issue 互动，无法提取直接反馈）*  
建议维护者后续在 PR #583 中主动征集早期采用者对架构变更的兼容性担忧，尤其是对现有自定义 Agent 实现的影响。

---

### 8. 待处理积压  
需关注以下长期未闭环事项（基于历史上下文推断）：  
- **#399 Agent Middleware Pipeline 整体路线图**：虽分阶段推进，但缺乏公开里程碑或验收标准，建议补充阶段性目标说明。  
- **#564（Phase 1 Pipeline 引入）**：作为 #583 的前置依赖，其设计决策可能影响当前重构，需确保两阶段间接口一致性。  

> 提醒维护者：PR #583 处于待合并状态，建议尽快完成代码审查并同步更新相关文档（如架构图或迁移指南），以降低后续集成风险。

---  
*数据来源：GitHub Repository [qhkm/zeptoclaw](https://github.com/qhkm/zeptoclaw) | 统计周期：2026-05-10 至 2026-05-11*

</details>

<details>
<summary><strong>EasyClaw</strong> — <a href="https://github.com/gaoyangz77/easyclaw">gaoyangz77/easyclaw</a></summary>

过去24小时无活动。

</details>

---
*本日报由 [Big Model Radar](https://github.com/gsscsd/big_model_radar) 自动生成。*