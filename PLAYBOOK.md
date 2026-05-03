# SFT 项目管理 Playbook

> 本文档沉淀 Hermes（小P）与 Mark 在 SFT 项目协作过程中的所有流程规范、调度机制和约定俗成。
> 是 Hermes 的工作手册，也是新成员了解团队运作规则的入口文档。
>
> **最后更新：** 2026-05-04
> **维护人：** Hermes（小P）
> **审批人：** 吉文（Mark）

---

## 1. 文档体系

| 文档 | 作用 | 更新机制 | 谁更新 |
|------|------|---------|--------|
| `docs/PRD.md` | 产品需求唯一事实来源 | Mark 直接编辑 commit，Hermes 同步理解 | Mark（主）、Hermes（辅助） |
| `docs/WBS.md` | 开发任务工作分解 | Hermes **主动**更新，不等确认 | Hermes（小P） |
| `ISSUE_LOG.md` | 测试缺陷追踪 | Hermes **主动**更新，验收后标记 | Hermes（小P） |
| `docs/TEST_SUITE.md` | 测试用例套件 | 小Q执行后 Hermes 更新 | Hermes（小P）调度小Q |
| `CONTRIBUTING.md` | 开发规范和流程 | 流程变更时更新 | Hermes（小P） |
| **`PLAYBOOK.md`** | **本文件**，团队协作手册 | Mark 提出或 Hermes 沉淀 | Hermes（小P） |

> **Doc-Sync（定时任务）是兜底方案，不是主力。** 所有文档更新由 Hermes 主动完成，Doc-Sync 只在 Hermes 离线时补位。

---

## 2. 团队角色

| 角色 | 名称 | 职责边界 |
|------|------|---------|
| 最终审批人 | 吉文（Mark） | 拍板重大决策，审批 PR 合并 |
| PM / Agent | 小P（Hermes） | 需求理解、任务拆解、WBS维护、文档主动更新、调度CC/小Q、验收 |
| PM / Agent | 小A | 同小P，独立负责前端/UI模块 |
| 测试 Agent | 小Q | 仅执行功能测试，不做开发，由小P调度 |

**重要原则：**
- Hermes（小P/小A）**不做编码**，只做需求/拆解/验收，所有编码交给 CC
- 小Q **只做测试**，不做开发
- 两组均为**全栈**，不区分前端后端

---

## 3. Hermes 与 Mark 沟通规范

### 3.1 沟通渠道
- **首选：飞书语音消息**（速度快，Mark 习惯用语音）
- 文字补充：飞书文字消息
- 文件传递：飞书附件

### 3.2 Hermes 主动行为（无需 Mark 确认）
以下行为 Hermes **直接执行，不问**：
- 验收 CC 开发成果 → 立即更新 WBS 状态 + commit + push
- ISSUE_LOG 标记 Resolved → 立即更新 + commit + push
- 发现 PRD/WBS/ISSUE_LOG 之间逻辑冲突 → **主动修正并通知 Mark**
- CC 开发完成 build 通过 → 立即通知 Mark 结果（语音 + 简短文字）

### 3.3 Hermes 必须汇报给 Mark 的
- 重大技术决策（涉及架构、安全、第三方依赖）
- CC 连续失败 2 次以上
- PRD 有理解不清的地方
- Push 需要 force-push 时（必须先申请）

### 3.4 Mark 的沟通习惯
- 语音消息为主，依赖飞书自带 ASR
- 时间紧迫，要求并行工作流（CC 后台持续干活，不被需求讨论打断）
- 需求调研两段式：① 小P提问回答捋清流程 → ② Mark 系统梳理补充

---

## 4. 文档更新规则（核心）

### 4.1 WBS 更新时机
| 场景 | 动作 |
|------|------|
| CC 任务开发完成，验收通过 | 立即将 WBS 任务状态改为 ✅ 已验收，备注栏写清楚实际产出，commit + push |
| CC 任务部分完成 | 立即更新备注栏说明完成内容，不等全部完成 |
| 发现前面章节有冲突 | **主动修正**并通知 Mark |
| 每次聊完一段需求 | **主动更新** BRS/WBS，不等 Mark 提醒 |

### 4.2 ISSUE_LOG 更新时机
| 场景 | 动作 |
|------|------|
| 验收 CC 修复的 bug | 立即标记 Resolved + 时间戳 |
| 小Q 测试发现新缺陷 | 立即新增 entry，分配 Severity 和 Owner |
| ISSUE_LOG 状态变更 | 自动同步更新，不等 Doc-Sync |

### 4.3 WBS 与 ISSUE_LOG 区分

| 文件 | 性质 | 内容 |
|------|------|------|
| **WBS** | 开发任务包 | PRD 拆解后的实现工作包（功能点、API、UI） |
| **ISSUE_LOG** | 测试缺陷 | 测试过程中发现的 bug、异常、非预期行为 |

**示例：**
- ❌ 错误：`#5 Dashboard 全是 Mock` → 不是 bug，是还没实现的功能 → 进 WBS
- ✅ 正确：`#16 Approval.vue 渲染失败空白页` → 测试发现的真实 bug → 进 ISSUE_LOG

---

## 5. CC 调度机制（Terminal 后台方式）

### 5.1 调度方式：终端后台进程

CC 通过 **WSL 终端后台进程** 调度，不阻塞 Hermes 与 Mark 的沟通。

**已验证可用的方式（`$(cat)` 插值）：**
```bash
cd /mnt/d/Git/SandvikForecastTool && \
ANTHROPIC_API_KEY="sk-cp-..." \
ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" \
/home/markji/.hermes/node/bin/claude \
  --dangerously-skip-permissions \
  --print \
  -p "$(cat /path/to/task_prompt.txt)" \
  --max-turns 100 \
  2>&1 &
```

**关键点：**
- prompt 先写入 `~/.hermes/cron/cc-<task>.txt` 文件
- 通过 `$(cat)` 插值传给 CC，避免 stdin 管道导致的进程退出问题
- `background=true` + `notify_on_complete=true` 的 Hermes 工具组合**不适用于长时间运行命令**（进程会立即退出），改用上述 `&` 后台运行方式

### 5.2 调度参数
| 参数 | 值 | 说明 |
|------|-----|------|
| `--max-turns` | 100 | Mark 指定的长任务步数上限 |
| Base URL | `https://api.minimaxi.com/anthropic` | MiniMax CN Anthropic 兼容端点 |
| Profile | `minimax-ai` | CCS MiniMax 配置名 |

### 5.3 CC 任务状态追踪
- 启动后通过 `ps aux | grep "claude.*max-turns"` 检查进程是否存在
- CC 完成后 Hermes 收到通知，验证 build，验收
- 验收通过 → 更新 WBS + ISSUE_LOG + commit

### 5.4 CC 任务拆解规则
每个 CC 任务包含：
1. **上下文**（当前代码状态、文件路径、API 签名）
2. **明确的任务描述**（T-XXX，PRD 章节引用）
3. **分步骤执行**（避免一次性给太多要求）
4. **Build 验证步骤**（必须 `dotnet build` + `npm run build` 通过才算完成）
5. **报告格式**（完成内容 + 修改文件清单）

---

### 5.5 调度限制（Session 无记忆）

> ⚠️ **已知限制，记录于 2026-05-04**

**CC 调度：**
- 每次 `claude --print -p "..."` 都是全新 session
- 单次 `--max-turns=N` 内有多轮对话（CC 记得上下文）
- 跨调用之间**不记得**上次做了什么
- **影响：** 需要传递完整上下文（文件路径、之前尝试过的方案、卡点位置）

**小Q 调度（tmux spawn 方式）：**
- 每次 `tmux new-session -d "hermes -p slh-bot chat -q '...'"` 都是全新 session
- 单次调用内有多轮对话（小Q 记得上下文）
- 跨调用之间**不记得**上次做了什么
- **影响：** 多轮测试场景需要任务文件传递上下文

**适合的工作方式：**
- ✅ 单次完成的任务（修 bug、加字段）
- ✅ 多轮但分次独立调用（每次传完整上下文）
- ⚠️ 需要小Q 持续跟踪多个测试项 → 需要任务清单文件传递

---

### 5.6 小Q 调度方式（独立 Agent vs Subagent）

> ⚠️ 2026-05-04 新认知：小Q 应为独立 Hermes Agent，不是我内部的 subagent。

**目标架构：**
```
Mark ←→ Hermes（小P）←→ 小Q（独立Agent）
                      ↕
                    小A（独立Agent）
```
- 每个 Agent 是独立的 hermes-agent 进程，有自己的 config.yaml 和 Feishu 身份
- Hermes 通过 Feishu DM 或 cronjob 与小Q通信
- 小Q 完全独立运行，不依赖 Hermes 的 session 存活

**当前可做到的方案（近期）：**
1. Hermes 写好 Playwright 测试脚本 → 存入 repo
2. Cronjob 定时或手动触发 → 小Q（独立 Agent）执行脚本
3. 结果写回文件 → Hermes 检测到 → 通知 Mark

**待探索（远期）：**
- 小Q 作为独立 hermes-agent 进程，监听 Feishu 指令队列
- Hermes 发指令 → 小Q 主动拉取 → 执行 → 结果回写

---

## 6. 小Q 调度流程（tmux spawn 方式）

> ⚠️ **当前实现（2026-05-04）：** 使用 `tmux new-session -d` 派发任务到 slh-bot（暂代小Q）
> ⚠️ **长期目标：** 小Q 作为独立 hermes-agent 进程，有自己的 Feishu 身份

```
小P 验收 CC 开发成果
    ↓
小P 写任务到文件（如 /tmp/xiaoq_task.md）
    ↓
小P 执行：tmux new-session -d -s <session> "hermes -p slh-bot chat -q 'read /tmp/xiaoq_task.md → 测试 → 写 /tmp/xiaoq_result.md'"
    ↓
小Q（slh-bot 暂代）后台执行，非阻塞
    ↓
小Q 执行完成后写 /tmp/xiaoq_result.md
    ↓
小P 读取结果 → 决策：
  - PASS → 更新 ISSUE_LOG（标记 Resolved）+ WBS（标记 ✅）+ 通知 Mark
  - FAIL → 打回 CC 修复，循环
```

**小Q 职责边界：**
- 只做测试，不做开发
- 由小P调度，不接受其他来源指令
- 结果返回小P，不直接通知 Mark

---

## 7. Git / Push 规范

| 规则 | 说明 |
|------|------|
| **默认用普通 `git push`** | 不用 force-push |
| **force-push 必须 Mark 审批** | 发飞书 DM 拿到确认后才能执行 |
| **Build 失败不 push** | Doc-Sync 检测到 build 失败会静默跳过 |
| **探索期直接写 master** | CC 探索式开发代码直接 commit master，不走 PR |

**Commit 格式：**
```
<type>: <简短描述>

type: feat | fix | docs | refactor | test | chore
```

---

## 8. Doc-Sync 兜底机制

### 8.1 职责边界
**主力是 Hermes 主动更新，Doc-Sync 只是离线/遗漏时的补位。**

### 8.2 Doc-Sync 检测逻辑
- PRD/WBS/ISSUE_LOG 任一有 commit 变化 → Hermes 分析 diff → 同步相关文档
- 代码有未 commit 改动 + build 通过 → 自动 commit + push
- 代码有未 commit 改动 + build 失败 → **静默跳过，不 commit，发飞书告警**

### 8.3 触发频率
- 每 30 分钟自动运行一次

---

## 9. 项目基本信息

| 项目 | 值 |
|------|-----|
| 代码库 | `/mnt/d/Git/SandvikForecastTool` |
| GitHub | https://github.com/jiwenmang1983/sandvik-sales-forecast-tool |
| 主分支 | `master` |
| Mark GitHub | `jiwenmang1983` |
| Mark 飞书 | `oc_8ccffe3d553a727fa6053781b94b7bcd` |

### 技术栈
- **Backend:** ASP.NET Core 8 + EF Core + MySQL (Pomelo)
- **Frontend:** Vue3 + Vite + Ant Design Vue + axios
- **认证:** JWT（本地登录）+ M365 SSO（生产）
- **邮件:** 队列架构（IEmailQueueService + BackgroundService）

---

## 10. 快速命令参考

```bash
# 检查 CC 进程是否在跑
ps aux | grep "claude.*max-turns" | grep -v grep

# 检查 backend build
cd /mnt/d/Git/SandvikForecastTool/backend/src/SandvikForecast.Api && dotnet build --nologo

# 检查 frontend build
cd /mnt/d/Git/SandvikForecastTool/frontend && npm run build 2>&1 | tail -10

# 查看最后 commit
cd /mnt/d/Git/SandvikForecastTool && git log --oneline -5

# 启动 CC 长任务（后台）
cd /mnt/d/Git/SandvikForecastTool && \
ANTHROPIC_API_KEY="sk-cp-..." ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" \
/home/markji/.hermes/node/bin/claude --dangerously-skip-permissions --print \
-p "$(cat ~/.hermes/cron/cc-task.txt)" --max-turns 100 2>&1 &
```

---

*本文档由 Hermes 小P 维护，Mark 审批后生效。*
