# SFT Playbook — Hermes 小P 运营手册

> 本文件是 SFT 项目的核心协作规则，所有参与者（Mark / 小P / CC / 小Q）共享。
> 维护：小P主动更新，Mark 最终审批。
> 每次规则变更需 Mark 口头确认。

---

## 一、文档体系

### 1.1 文档列表


| 文档              | 用途                              | 维护人 | 更新时机        |
| --------------- | ------------------------------- | --- | ----------- |
| PRD.md          | 产品需求唯一真相源（§1~§13，上半部分业务/下半部分技术） | 小P  | 需求变更时       |
| WBS.md          | 开发任务分解 + 状态追踪                   | 小P  | 每任务完成时      |
| TESTCASE.md     | 测试用例库 + Q-XXX 状态表               | 小P  | 每测试完成时      |
| ISSUE_LOG.md    | Bug / 逻辑缺口 / API 问题追踪           | 小P  | 发现时立即       |
| PLAYBOOK.md     | 本文件，协作规则                        | 小P  | 规则变更时       |
| HERMES_TASKS.md | 任务委派追踪 + 调度器状态记录                | 小P  | 任务委派/完成/取消时 |


**优先级原则：PRD.md 是所有开发任务的唯一规格来源。其他文档不得与 PRD.md 冲突，冲突时以 PRD.md 为准。**

### 1.2 文档更新触发规则

```
【强制】每完成一个开发/测试任务，小P 主动更新以下文档，不等 Mark 提醒。
【强制】跟 Mark 聊天后，根据聊天记录自动识别需要更新的文档并立即更新。

开发任务完成（CC）
  → WBS.md  T-XXX  🔄→✅
  → PRD.md  同步确认的逻辑（如有）
  → ISSUE_LOG.md  新增Bug记录（如有）

测试任务完成（小Q）
  → TESTCASE.md  Q-XXX  🔄→✅/❌
  → WBS.md       测试列更新
  → ISSUE_LOG.md  新增Bug记录（如有）

跟 Mark 聊天后
  → 识别涉及哪些文档（PRD/WBS/TESTCASE/ISSUE_LOG/PLAYBOOK/HERMES_TASKS）
  → 有变更立即更新，不等下一次

文档更新由各负责人在任务完成时主动执行；doc_sync cronjob 每30分钟兜底扫描。
```

### 1.3 联动修改范围

发现某文档需要修改时，同步检查以下文档是否也要调整：


| 本次修改                   | 需同步检查                               |
| ---------------------- | ----------------------------------- |
| PRD.md §X              | TESTCASE.md / WBS.md / ISSUE_LOG.md |
| WBS.md T-XXX           | PRD.md 相关章节 / TESTCASE.md Q-XXX     |
| TESTCASE.md TC-XXXX    | WBS.md 测试关联                         |
| ISSUE_LOG.md Issue状态变更 | TESTCASE.md 对应测试状态（验证结果同步）          |
| HERMES_TASKS.md 任务状态变更 | WBS.md / TESTCASE.md/Issue_Log.md   |
| 任何文档                   | 发现前面章节有冲突也一并修正                      |


---

## 二、角色与分工

### 2.1 角色定义

```
Mark（吉文）  → 指挥官，最终审批人，所有重大决策
小P（Hermes） → 产品经理 + 调度员，修文档 / 拆需求 / 派任务 / 验收
CC              → 编码开发，小P委派后执行
小Q（slh-bot） → 测试工程师，小P委派后执行
```

### 2.2 分工边界（强制，不跨域）

```
小P 不做                         CC/小Q 不做
────────────────────────         ────────────────────────
写代码                           修文档（PRD/WBS/PLAYBOOK）
直接操作 DB                      自行决定需求逻辑
代替 CC/小Q 做决策               跨域协作（找 Mark 直接要答案）
跳过文档直接开发                  在 PRD 未确认前开始开发

核心原则：小P 修文档派任务，CC/小Q 执行，不交叉混乱。
```

---

## 三、CC 协作规范

### 3.1 调用方式

```bash
cd /mnt/d/Git/SandvikForecastTool
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
  ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" \
  claude --dangerously-skip-permissions --print \
  -p "任务描述（必须含五段式，见3.2）" \
  --max-turns 99
```

（API Key 具体值见 §3.6）


| 参数                               | 作用                         |
| -------------------------------- | -------------------------- |
| `--dangerously-skip-permissions` | 跳过每次确认提示，自动化必需             |
| `--print`                        | 结果输出到 stdout（非交互TTY），小P可捕获 |
| `-p "..."`                       | 内联任务描述，不依赖文件               |
| `--max-turns N`                  | 防止无限循环，99步适合大多数任务          |


**CC 步数经验值：**


| 步数                   | 适用场景                                              |
| -------------------- | ------------------------------------------------- |
| 35步                  | 3-4个文件                                            |
| 50步                  | 5-6个文件                                            |
| 99步                  | 7+文件或完整功能（标准值）                                    |
| `ANTHROPIC_BASE_URL` | 必须 = `https://api.minimaxi.com/anthropic`（不是 /v1） |


### 3.2 任务委派五段式（每次必须完整）

```markdown
【背景】
来源：PRD §X.X / T-XXX
问题：当前状态/已知的Bug
目标：交付什么

【约束】
- 已确定的技术决策：...
- 不得修改：Entity结构 / 数据库schema
- 开发环境：ASPNETCORE_ENVIRONMENT=Development（JWT认证）

【目标】
1. ...
2. ...

【验收条件】
- [ ] dotnet build 通过，0 errors
- [ ] 所有 Migration 已 apply（dotnet ef migrations list 确认无 pending）
- [ ] API curl 验证通过
- [ ] 结果写入 /tmp/cc_result_<taskid>.json

【环境信息】
工作目录：/mnt/d/Git/SandvikForecastTool/backend/src/SandvikForecast.Api
API 端口：5000（dotnet run --urls=http://0.0.0.0:5000）
DB：appsettings.Development.json
认证：Bearer Token（开发环境）
```

### 3.3 工作流（探索期：CC 直接写 master）

**⚠️ 重要：CC 委派必须用终端后台，不可用 delegate_task**

```
1. 小P 写 prompt 到文件：/tmp/cc_task_<taskid>.txt（五段式，见3.2）
2. 小P 用 terminal(background=True) 启动 CC：
   terminal(background=True,
     command=(
       'cd /mnt/d/Git/SandvikForecastTool && '
       'ANTHROPIC_API_KEY="sk-cp-AUnpds5ndMyU9JT_zzPyUr81Dg_BFOmzKVHXisUMgvqRE9Zqdb7zFb-elTi9liCZINk0BTEk8Sq9etMkPJgXausjqEOdYwe1VlQIhey2tRROq08nROkSWD8" '
       'ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" '
       '/home/markji/.hermes/node/bin/claude '
       '--dangerously-skip-permissions --print '
       '-p "$(cat /tmp/cc_task_<taskid>.txt)" '
       '--max-turns 99 2>&1 | tee /tmp/cc_<taskid>_output.txt'
     ))
3. CC 在 WSL 后台执行（--print 模式，不阻塞 Hermes 主会话）
4. CC 完成后，小P 检查 /tmp/cc_<taskid>_output.txt 验证结果
5. 小P 执行后续步骤：
   a. dotnet build（验证编译）
   b. dotnet ef database update（如有 migration）
   c. dotnet run（服务重启）
   d. curl 验证关键接口
   e. git add + commit + push（探索期：直接 push master，不走 PR）
6. 结果写入 /tmp/cc_result_<taskid>.json（可选）
7. 小P 验证，更新文档
```

**追踪 CC 进程：**

```bash
ps aux | grep claude | grep -v grep
# 有输出 = 在跑；无输出 = 已完成（检查 output.txt）
```

**禁止使用的方式：**

- ❌ `delegate_task(acp_command="claude")` — 会被打断，不可用
- ❌ foreground 模式 — 阻塞 Hermes 主会话，导致无法响应用户
- ❌ `cat file | claude -p` — 会产生两个进程

### 3.4 结果文件格式

CC 完成任务后必须写入：

```json
{
  "task_id": "cc_<taskid>",
  "status": "success | failure",
  "build": "pass | fail",
  "migration_applied": true,
  "api_verification": "pass | fail",
  "files_changed": ["file1.cs", "file2.cs"],
  "commit_sha": "abc1234",
  "notes": "..."
}
```

路径：`/tmp/cc_result_<taskid>.json`

### 3.5 完成标准（ Checklist）

```
[ ] dotnet build 通过，0 errors
[ ] dotnet ef migrations add（如有 schema 变更）
[ ] dotnet ef database update（必须执行，migration 不 apply = 功能不可用）
[ ] API 服务重启
[ ] curl 验证关键接口
[ ] git commit + push
[ ] 结果写入 /tmp/cc_result_<taskid>.json
```

> ⚠️ **DB Migration 是最后一道防线**：代码 `dotnet build` 通过不代表功能在 DB 层可用。每次 schema 变更必须确认 `dotnet ef migrations list` 无 pending，再验证 API。

### 3.6 当前配置

**CCS（Claude Code Switch）作用：**

> CCS 是 Claude Code 的模型路由层。通过 `ccs sync` 实时切换 AI 模型（MiniMax / OpenAI）和 API Key，无需改代码。CCS 配置文件在 `~/.ccs/*.settings.json`。

**修改 CCS 配置步骤（以换 Key 为例）：**

```
1. 编辑配置文件（两个 profile 均需更新）：
   nano ~/.ccs/minimax-ai.settings.json
   nano ~/.ccs/minimax-openai.settings.json
2. 写入新的 API Key
3. 执行 ccs sync 使配置生效
4. curl 测试：curl -s -o /dev/null -w "%{http_code}" https://api.minimaxi.com/anthropic/v1/models
   → 返回 200 即生效
```

**当前配置：**

```
Provider：MiniMax CN
Base URL：https://api.minimaxi.com/anthropic（⚠️ 不是 /v1）
Model：MiniMax-M2.7
Key：sk-cp-...SWD8（完整值见 ccs-admin skill）
Token Plan 限额：4500/4500（刷新时间：每5h，当前15:00刷新）
Rate Limit 处理：429 → 等到下一个整点再试
CCS profile：minimax-ai（主要），minimax-openai
```

### 3.7 连续会话模式（tmux 交互）

> 适用场景：复杂任务需要多轮对话（>15步）、中途需要授权确认、或 CC 主动提问。
> 不适用：简单单次任务（直接用 §3.1 一次性 `-p` 模式即可）。

**两种 CC 运行模式对比：**

| 模式 | 命令 | 上下文保持 | 实时反馈 | 适用场景 |
|------|------|----------|---------|---------|
| 一次性（§3.1） | `claude -p '...'` | ❌ 每次全新 | ❌ | 简单明确的任务 |
| **tmux 交互（本节）** | `tmux new-session ... && claude` | ✅ 全程保持 | ✅ | 复杂/多轮/授权场景 |

---

**3.7.1 启动与权限确认**

```bash
# 1. 清理并启动命名 tmux 会话
tmux kill-session -t cc-sandvik 2>/dev/null; sleep 1
tmux new-session -d -s cc-sandvik
tmux send-keys -t cc-sandvik \
  'cd /mnt/d/Git/SandvikForecastTool && ANTHROPIC_API_KEY="sk-cp-..." ANTHROPIC_BASE_URL="https://api.minimaxi.com/anthropic" claude --dangerously-skip-permissions --model MiniMax-M2.7' \
  Enter

# 2. 等待 CC 启动（约8s）
sleep 8

# 3. 确认 workspace 信任（发 1 后立即 Enter）
tmux send-keys -t cc-sandvik '1' Enter
sleep 5

# 4. 确认 bypass 权限状态（如果出现 ❯ 等待则再 Enter）
tmux capture-pane -t cc-sandvik -p -S -5   # 查看状态
# 若底部有 ❯ 等待提示：tmux send-keys -t cc-sandvik Enter
```

> **实测注意：** `⏵⏵ bypass permissions on (shift+tab to cycle)` 只是状态行，不是阻塞提示。CC 加载完成后会在底部显示 ❯，此时可以直接发任务。如果 CC 在思考（Ideating/Thinking/Cooking），等它完成。

---

**3.7.2 发送任务**

```bash
# 发送任务（发完立即继续做其他事，不用干等）
tmux send-keys -t cc-sandvik '你的任务描述...' Enter
```

**轮询进度（不等结果，继续并行工作）：**

```bash
tmux capture-pane -t cc-sandvik -p -S -10 | cat
```

**判断 CC 状态：**

| 底部显示 | 含义 | 操作 |
|---------|------|------|
| `❯` + `Thinking`/`Ideating`/`Cooking` 等词 | CC 在思考 | 等待 |
| `❯` 末尾，无特殊词 | CC 空闲，可发新任务 | ✅ 可发任务 |
| `❯` + `esc to interrupt` | CC 长时间等待 | 可中断或发指令 |
| `Agent(…)` + `Done (N tool uses)` | CC 刚完成一步 | 等待或看输出 |
| `● 回复内容` | CC 产出了回复 | 看结果 |

---

**3.7.3 实时反馈与中断**

```bash
# A. CC 在等输入 → 直接发答案
tmux send-keys -t cc-sandvik '答案内容' Enter

# B. CC 卡住（>2分钟无响应）→ Ctrl+C 中断后重发
tmux send-keys -t cc-sandvik C-c
sleep 2
tmux send-keys -t cc-sandvik '重新描述任务' Enter

# C. CC 需要确认（如 "Do you want to create file? 1.Yes 2.No"）
tmux send-keys -t cc-sandvik '1' Enter   # 同意

# D. 出现 ? for shortcuts 提示 → 按 q 或 ESC 关掉
tmux send-keys -t cc-sandvik 'q'
sleep 1

# E. 强制终止会话
tmux kill-session -t cc-sandvik
```

---

**3.7.4 响应时间基准（MiniMax-M2.7 实测）**

| 任务类型 | 典型响应时间 |
|---------|------------|
| 简单问题（1+1、名字记忆） | 5-15s |
| 文件搜索/读取（< 10个文件） | 15-30s |
| 代码创建/修改（Controller、Service） | 60-180s |
| CC 主动思考/规划 | 30-90s（等待 `❯` 出现） |

> **等待策略：** 发任务后先等 30s 抓一次 pane 判断 CC 在做什么。如果在 Ideating/Thinking，继续等 60-90s；如果在执行工具，60s 后再看。不干等 90s 不看——用轮询。

---

**3.7.5 与 §3.1 一次性模式的选用原则**

```
简单任务（1-3步，明确知道要什么）   → §3.1 一次性 claude -p
复杂任务（需要分析、多次迭代）      → §3.7 tmux 交互
中途需要授权/CC 主动提问           → §3.7 tmux 交互
长时间运行（>2分钟）               → §3.7 tmux 交互
```

---

**已知限制：**
1. **`--dangerously-skip-permissions` 对 Bash 命令授权不完全生效**：CC 在执行 Bash 命令时会弹出授权确认（路径访问、命令执行等），仍需手动按 `1` approve 一次。
   - **Workaround**：首次 bypass 后选 `2" Yes, and allow..."` 授予宽泛权限，后续同项目任务不再弹窗。
2. **MiniMax API 429 限制**：4500单位/5小时窗口。大任务前用 `curl` 先测 API 状态。
3. **CC 长时间思考（>2分钟）**：通常是 CC 在规划或等待 API。用 Ctrl+C 中断，换更精准的指令重试。
4. **`? for shortcuts` 覆盖层**：按 `q` 或 `ESC` 关闭，不阻塞主流程。

---

## 四、小Q 协作规范

### 4.1 两种调用模式

小Q（`slh-bot`）有两种调用模式，适用不同场景：

| 模式 | 命令 | 上下文保持 | 适用场景 |
|------|------|----------|---------|
| **对话模式**（§4.2） | `hermes -p slh-bot chat -q "..." --resume SESSION_ID` | ✅ SQLite session 续接 | 需要 LLM 推理的复杂测试分析 |
| **脚本模式**（§4.3） | `python3 /tmp/q_test.py` | N/A | 标准 API 测试，无需 LLM 参与 |

> ⚠️ **不再禁止 `hermes -p slh-bot chat -q`** —— 实测验证：`-q` 是 blocking 调用，会返回结果，不会"永远卡死"。blocking 指的是单个命令在 shell 层面等结果，但 Hermes 可用 `&` 并行发多个任务，不影响同时调度其他 agent。

### 4.1.1 整体 Agent 通讯架构

```
Mark（吉文）
  └── 飞书 DM → Hermes（小P，我）
                       ├── tmux send-keys → CC（cc-sandvik）
                       │                   全程同一 tmux session，上下文不中断
                       │
                       ├── hermes -p slh-bot chat -q → 小Q（slh-bot）
                       │   --resume SESSION_ID   ← 必须带，续接 SQLite session 上下文
                       │   两条路径：
                       │     ① 对话模式（§4.2）→ LLM 推理分析
                       │     ② 脚本模式（§4.3）→ python3 直接跑
                       │
                       └── CC 和小Q 并行，互不等待
```

**通讯原则：**

| 通道 | 方式 | 隔离需求 | 原因 |
|------|------|---------|------|
| Mark ↔ Hermes | 飞书 DM | — | 唯一入口 |
| Hermes ↔ CC | tmux send-keys / capture-pane | ✅ 必须 tmux | CC 有授权弹窗，需要隔离 |
| Hermes ↔ 小Q | `hermes -p slh-bot chat -q` | ❌ 不需要 | slh-bot 无授权弹窗，blocking 不影响并行 |
| CC ↔ 小Q | 无直接通道 | — | Hermes 居中转发 |

**调度原则：**
- Hermes 同时只调度一个任务给 CC，一个任务给小Q
- CC 和小Q 并行执行，互不等待
- Hermes 发完指令后继续处理 Mark 的其他消息，不需要等 slh-bot 返回
- Hermes 可用 `&` 将 `hermes -p slh-bot chat -q` 变成后台进程，同时调度多个 agent
- **小Q调用必须带 `--resume SESSION_ID`**：不带则每次是新 session，无上下文；带则续接 SQLite session 上下文

### 4.2 对话模式（session resume）

适用场景：需要小Q 做复杂推理、多步骤分析、或中途交互的测试任务。

**Step 1：发起第一次对话，捕获 session ID**

```bash
RESULT=$(hermes -p slh-bot chat \
  -q "执行以下测试分析：...（完整任务描述）..." \
  --max-turns 10 2>&1)
echo "$RESULT"

# 从输出中提取 session ID：
SESSION_ID=$(echo "$RESULT" | grep "^Session:" | awk '{print $2}')
# 例如：20260507_233415_e1c9cd
```

**Step 2：续接同一 session 继续对话**

```bash
# 后续多轮对话，用 --resume 保持上下文
RESULT=$(hermes -p slh-bot chat \
  -q "TC-0302 失败了，分析原因：..." \
  --resume "$SESSION_ID" \
  --max-turns 10 2>&1)
echo "$RESULT"
```

**解析结果（过滤 TUI chrome）：**

```bash
# 提取纯文本回复（去掉 TUI 边框/颜色码）
echo "$RESULT" | grep -v "^╭\|^│\|^╰\|^─\|^ ⚕\|^$" | grep -v "^Session:\|^Duration:\|^Messages:\|^⚠\|^Resume this" | head -50
```

**判断对话状态：**

| 输出关键词 | 含义 | 操作 |
|-----------|------|------|
| `⚠ Iteration budget reached` | 达到 max-turns，上下文可能截断 | 下次提高 `--max-turns` |
| `Session: xxx` | 对话正常完成 | 提取回复内容 |
| `↻ Resumed session` | 上下文续接成功 | ✅ 正常 |
| `No previous session` | session ID 无效或已过期 | 重新发起新对话 |

**与 tmux 交互模式的对比：**

| | 对话模式（本节） | tmux send-keys 交互 |
|---|---|---|
| 上下文保持 | ✅ SQLite session resume | ✅ 同一 tmux session |
| 响应解析 | ✅ 相对干净（grep 过滤） | ⚠️ TUI chrome 难以提取 |
| 实时可见 | ❌ 只能等完成 | ✅ capture-pane 可看中间态 |
| 命令注入 | N/A | ⚠️ 发送太快会粘合 |
| 推荐场景 | **首选**，复杂推理/分析 | 备选，LLM 推理过程中需要中途干预 |

### 4.3 脚本模式（API 测试）

适用场景：标准化的 API 测试用例（TC-XXXX），脚本内部完成认证+测试+断言。

> **为什么不用 slh-bot 执行脚本？** slh-bot 在"执行脚本"这件事上只是哑巴执行器，不用到它的测试技能，没有价值增量。
> 脚本直接 `python3` 跑，slh-bot 留给需要 LLM 推理的场景（§4.2）。

**执行方式（两行搞定）：**

```bash
# 直接运行，不经过 slh-bot，不经过 tmux
python3 /tmp/q<NNN>_test.py 2>&1 | tee /tmp/q<NNN>_result.txt

# 轮询等待结果：
while ! tail -1 /tmp/q<NNN>_result.txt | grep -qE 'PASS|FAIL|ERROR|Q-NNN COMPLETE'; do
  sleep 5
done
cat /tmp/q<NNN>_result.txt
```

**结果解析 + 文档更新（§4.3 段3）：**

```
→ 解析 /tmp/q<NNN>_result.txt 末尾判断 PASS/FAIL
→ TESTCASE.md Q-XXX 状态更新
→ ISSUE_LOG.md 新增 Bug 记录（如有）
→ 有变更立即更新，不等 Mark 提醒
```

**脚本规范：**
- 文件名：`/tmp/q<NNN>_test.py`（Q-XXX 任务编号）
- 脚本内部获取 token（`Password123`），不写 token 到文件
- 最后一行打印：`PASS` / `FAIL` / `Q-NNN COMPLETE`
- API Base：`http://localhost:5000`

### 4.4 测试类型与标准

按测试类型不同，验收标准也不同：

| 测试类型 | 格式 | 执行时机 | 验收标准 |
|---------|------|---------|---------|
| **Q-FW（框架探测）** | `Q-FW1`/`Q-FW2`/`Q-FW3` | 功能测试前必须先跑框架探测 | 所有端点 200/201，无 404/500 |
| **Q-XXX（功能 E2E）** | `Q-001`~`Q-999` | 框架稳定后执行 | 所有 TC PASS，响应格式符合 API 规范 |
| **Q-UI（页面交互 E2E）** | `Q-UI1` 等 | 每次前端构建或路由变更后 | Playwright TC-01~TC-07 全部 PASS，无 console.error |
| **Q-E2E（完整链路）** | `Q-E2E1` 等 | Phase 3 多轮测试 | 端到端业务场景全覆盖 |
| **性能压测** | `Q-PB1` 等 | 大版本发布前 | 响应时间 P95 < Xms，并发 Y |
| **证据收集** | `Q-EV1` 等 | 验收节点 | 证据链完整，可供 Mark 审批 |

**Q-FW（框架探测）标准：**
```
探测目标：API 路由注册 + 响应格式统一
探测数量：8 个核心端点
执行时间：10-15 分钟
通过标准：所有端点 HTTP 200/201，无 404，无 500
失败处理：框架 Bug 立即录入 ISSUE_LOG，同时通知 Mark

Q-FW 必须先于 Q-XXX 执行：
  → 框架不稳定时跑功能测试 = 浪费几小时得到误导性结果
  → Q-FW 发现 4 个框架 Bug（BUG-022~025）只需 10 分钟
```

**Q-XXX（功能 E2E）标准：**
```
探测目标：业务逻辑（CRUD + 审批流 + 软删除等）
执行顺序：认证→基础数据→创建记录→草稿/提交→审批流→完整 E2E
通过标准：
  [ ] 所有 TC PASS（TC-XXXX → PASS/FAIL）
  [ ] 响应格式符合 ApiStandardResponseFilter 规范（{code:0, data:...}）
  [ ] 关键字段读写正常（id / status / createdAt 等）
  [ ] 数据库实际写入验证（Q-FW2）
```

**测试执行顺序原则：**
```
Q-FW1（路由探测）→ Q-FW2（DB写入）→ Q-FW3（软删除）→ Q-001~Q-E2E1
前端变更后 → Q-UI1（Playwright TC-01~TC-07）→ Q-XXX（如有 API 联动变更）
```

### 4.5 标准脚本模板

```python
import urllib.request, json

BASE = 'http://localhost:5000'
EMAIL = 'admin@sandvik.com'
PASSWORD = 'Password123'

def api(method, path, token=None, data=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(url,
        data=json.dumps(data).encode() if data else None,
        headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        body = resp.read()
        return json.loads(body) if body else {'_empty': True}
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return {'_http_error': e.code, '_body': json.loads(body)}
        except:
            return {'_http_error': e.code, '_body_raw': body.decode()[:200]}

# === 登录（脚本内部获取token）===
login_req = urllib.request.Request(BASE + '/api/auth/login',
    data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(),
    headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(login_req).read())['data']['token']
print('LOGIN: OK')

# === 测试用例 ===
# TC-XXXX: ...
print('TC-XXXX: PASS|FAIL ...')

print('Q-NNN COMPLETE')
```

### 4.6 小Q完成标准

**按测试类型分类：**

```
【Q-FW 框架探测】
[ ] 所有端点返回 200/201（无 404，无 500）
[ ] 响应格式统一（{code:0, data:...}）
[ ] Bug 记录同步到 ISSUE_LOG

【Q-XXX 功能 E2E】
[ ] 所有 TC PASS（TC-XXXX → PASS/FAIL）
[ ] 响应格式符合 ApiStandardResponseFilter 规范
[ ] 关键字段读写正常（id / status / createdAt / updatedAt）
[ ] 数据库实际写入验证（读取验证创建的数据）
[ ] TESTCASE.md Q-XXX 状态更新

【Q-E2E 完整链路】
[ ] 端到端场景全部通过
[ ] 审批流触发正确（Draft→Submitted→Approved）
[ ] 邮件队列触发验证（Q-FW2 确认 DB 写入）

【性能压测 / 证据收集】
[ ] 按专项要求验收（结果文件见 /tmp/xiaoq_result_*.json）
```

> ⚠️ **DB Migration 是最后一道防线**：API `dotnet build` 通过不代表 DB 层可用。Q-FW2 必须实际写入 DB 验证，不只是 API 返回成功。

### 4.7 当前小Q配置

**Profile：** `slh-bot`（Feishu WebSocket 独占，同一时间只能有一个 bot 连接）

**测试相关技能（通过 agency-agents 动态加载）：**

| 技能 | 用途 | 适用测试类型 |
|------|------|------------|
| `testing-api-tester` | API 功能测试、E2E 测试 | Q-FW / Q-XXX / Q-E2E |
| `testing-performance-benchmarker` | 性能压测、容量规划 | Q-PB1 等 |
| `testing-evidence-collector` | 测试证据链收集 | Q-EV1 等 |
| `testing-reality-checker` | 基于证据的验收评审 | 所有类型 |
| `testing-test-results-analyzer` | 测试结果度量分析 | 所有类型 |

**工具集：** 35 tools，82 skills，1 MCP server

**状态：** ⚠️ 815 commits behind（可忽略，不影响功能）

**已知约束：**
- Feishu WebSocket 独占：同一时间只能有一个 bot 连接
- slh-bot 持有 WebSocket（小Q的 Hermes Profile）
- 所有测试任务推荐用脚本模式（§4.3）或对话模式（§4.2）

**密码发现流程（重要）：**
> TESTCASE.md 中的账号密码**可能与运行时不一致**，必须通过源码确认。
> 正确密码（所有账号通用）：`Password123`
> 来源：`SeedController.cs` 的 `ResetUsers()` 方法
> 当认证失败时，调用 `GET /api/seed/reset-users` 重置密码

### 4.8 浏览器页面交互测试（E2E）

> 前端 Playwright E2E 测试是独立体系，与小Q的 API 测试互补。页面测试验证 UI 行为（表单提交、路由跳转、组件状态），API 测试验证数据层。两者都必须通过。

**Playwright E2E 测试现状：**

| 文件 | 覆盖范围 |
|------|---------|
| `frontend/app.spec.ts` | TC-01~TC-07：登录/仪表盘/预测/审批/基础数据/系统管理/导航 |

**Playwright 已有测试套件（TC-01~TC-07）：**
```
TC-01 🔐 登录模块     — 页面渲染/SSO跳转/未授权拦截
TC-02 📊 仪表盘       — KPI卡片/图表/指标切换
TC-03 📝 销售预测     — 表格/筛选/提交保存
TC-04 ✅ 审批         — 列表/筛选/详情Tab
TC-05 🗃️ 基础数据     — 组织/客户/产品
TC-06 ⚙️ 系统管理     — 用户/权限/版本/日志
TC-07 🧭 布局导航     — 侧边栏折叠/菜单
```

**浏览器测试执行方式（两种场景）：**

| 场景 | 执行方式 | 执行者 |
|------|---------|--------|
| 前端开发过程中 | `cd frontend && npx playwright test`（需 dev server 在 3002） | 开发/小A |
| 独立 E2E 轮次 | `npx playwright test --reporter=list`（通过 cronjob 定时跑） | 小Q（via shell） |

**浏览器测试完成标准：**
```
[ ] npx playwright test → 0 failures（TC-01~TC-07 全部 PASS）
[ ] 无 console.error（JS 异常）
[ ] 截图已保存（如有失败，test-results/ 有截图）
[ ] TESTCASE.md 页面测试状态同步更新
```

**注意：** slh-bot 已集成 `browser` 工具集（toolsets: [hermes-cli, browser]），两种场景互补执行：

| 场景 | 执行方式 | 执行者 | 说明 |
|------|---------|--------|------|
| 第一遍UI验证（探索性） | `browser_navigate` + `browser_vision` 截图确认 | Hermes（小P） | 功能首次实现后人肉验收，截图+判断 |
| 结构化回归测试 | `npx playwright test app.spec.ts` | 小Q（via shell） | TC-01~TC-07 批量跑，结果写文件，解析PASS/FAIL |

两者互补：Browser 解决"功能能不能用"的快速确认，Playwright 解决"功能有没有坏"的可靠回归。

---

## 五、代码提交规范

### 5.1 分支策略 + Git 规范（合并）

**当前阶段（探索期 — CC 直接写 master）：**

> CC 探索式开发，代码直接写入 master 分支，不走 PR 流程。
> CC 开发的代码 → 直接 commit 到 master → 普通 git push
> Mark 说"推送 master"时 → 直接 push master，不走 PR 流程

**远期阶段（规范期 — 标准 PR 流程）：**

> CC 流程稳定、代码质量有保证后，切换标准 PR 流程。
> feat/<功能简述> 分支开发 → commit → push → 创建 PR → Mark Review → 合并到 master
> 每日 23:00 自动创建 PR（小A组/小P组分别创建）
> Force-push 仍须 Mark 审批

### 5.3 Push 规则

```
默认：普通 git push（不用 force-push）
Force-push（如清理垃圾 commit）：必须先发飞书 DM 给 Mark 审批，拿到确认后才能执行
Push 失败（远程有新 commit）：发飞书通知 Mark，不自动 merge
每日 23:00 cron：检查 master 有未 push 的 commit → 自动 push；Build 失败则通知 Mark，不 push
```

### 5.4 Commit 规范

```
格式：<type>: <简短描述>
type：feat | fix | docs | refactor | test | chore
示例：
  feat: add InvoiceCompanyController route
  fix: resolve PUT /forecast-periods partial update
  docs: update TESTCASE.md with verified API routes
禁止：空 commit / 无意义的 WIP commit
```

### 5.5 Review 分组


| 代码分组 | 开发负责人 | Review 责任人 |
| ---- | ----- | ---------- |
| 小A组  | 小A    | 吉文（Mark）   |
| 小P组  | 小P    | 吉文（Mark）   |


> 各组完成开发与内部 Review 后提交 PR，通知 Mark 进行最终 Approve 并合并。
> 合并规则：至少 1 人 approve 方可合并。

### 5.6 Sandbox 自动提交

```
路径：/mnt/d/Git/Sandvik Sales Forecast Tool
触发：每天 18:30 检查未提交改动，有则自动 commit
格式：feat/fix/docs: 简短描述
实现：cronjob 定时任务
```

> ⚠️ 注意：每日 23:00 的 master push 检查是项目主仓库（jiwenmang1983/sandvik-sales-forecast-tool），不是 Sandbox。

---

## 六、测试文档体系

### 6.1 TESTCASE.md 结构

```
§1  测试分层规范（API / UI / E2E / 架构验证）
§2  角色测试账号（密码统一：Password123）
§3  TC-XXXX 测试用例（每个含：API端点/UI验收/预期结果/执行状态）
§4  UI 验收标准（F-01~F-11 页面截图标注）
§5  Q-XXX 测试任务对照表（执行状态追踪）
§6  PRD→TESTCASE 联动规则
```

### 6.2 Q-XXX 命名规则

```
Q-001~Q-010  核心功能测试
Q-011~Q-020  扩展功能测试
Q-021~       回归测试 / Bug 验证
```

### 6.3 测试状态流转

```
🔄待执行 → 🔄执行中 → ✅PASS | ❌FAIL | ⏭️跳过
```

---

## 七、Bug 追踪规范

### 7.1 ISSUE_LOG.md 结构

```
【运行时 Bug】      测试/E2E 中发现的 Bug
【API 路由问题】    端点不存在 / 返回格式不对
【逻辑缺口】        PRD 未覆盖需 Mark 确认
【Bug 修复记录】    已修复的 Bug + 修复方式
```

### 7.2 Issue 状态


| 状态          | 触发条件           | 更新人 |
| ----------- | -------------- | --- |
| 🔴 blocking | Mark 尚未回答的逻辑问题 | 小P  |
| ✅ 已解决       | Mark Q&A 确认后   | 小P  |
| ⏳ 待修复       | 确认的 Bug 尚未修复   | 小P  |
| ✅ 已修复       | 开发完成 + 测试通过    | 小P  |


---

## 八、已知问题 → 统一归口 ISSUE_LOG.md

> **已知问题不在 PLAYBOOK 中管理，统一收录在 `docs/ISSUE_LOG.md`。**
> PLAYBOOK 是团队协作公约规范，已知问题是运营追踪文档。
> API 路由验证记录、待修 Bug 列表均见 `docs/ISSUE_LOG.md`。

---

## 九、PRD 协作规范

### 9.1 引用 + 提取原则

给小P/CC/小Q 委派任务时：

```
1. 引用：明确告知 PRD §章节号
2. 提取：将关键规格直接写入任务描述，不依赖执行者自己查找
3. PRD 中已有结论（✅标注）的规则，不得要求重新讨论
```

### 9.2 PRD 未覆盖时的处理

```
1. 在 ISSUE_LOG.md 记录为 Issue（🔴 blocking）
2. 向 Mark 确认逻辑（飞书DM / 语音）
3. 确认后同步更新 PRD.md 相关章节
4. 再向 CC/小Q 委派任务
```

---

## 十、问题升级路径

> 按顺序排查，优先 Migration。

```
1. Migration apply 了没有？
   → dotnet ef migrations list（无 pending 才算 apply 过）
2. API 服务启动了没有？
   → curl http://localhost:5000/health
3. DB schema 对不对？
   → dotnet ef migrations list + 表结构查询
4. 认证 token 有效吗？
   → 重新 POST /api/auth/login
5. 代码和 DB 是否同步？
   → commit 是否有对应 migration
6. CC rate limit？
   → MiniMax 429 → 等下一个整点刷新
```

---

*本文档由 Hermes 小P 维护，Mark 最终审批。*
*最后更新：2026-05-05*