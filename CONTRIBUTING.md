# Contributing Guide

> 本项目（SFT）所有开发人员必须遵循本文档规范。
> 仓库：https://github.com/jiwenmang1983/sandvik-sales-forecast-tool | 分支：`master`

---

## 1. 团队角色

| 角色 | 负责人 | 职责 |
|------|--------|------|
| **最终审批人** | 吉文（Mark） | 确认并批准 PR 合并 |
| **PM / Agent** | 小A | 调度 CC 或 Codex 开发小A组代码，Review 后提交 PR |
| **PM / Agent** | 小P | 调度 CC 或 Codex 开发小P组代码，Review 后提交 PR |
| **PM / Agent** | 小Q | 测试工程师，由小P调度执行功能测试和自动化测试（Playwright + API） |

两组均为全栈，不区分前端后端。小Q是测试 Agent，不做开发，只做测试。

---

## 2. 文档体系

| 文档 | 说明 | 维护人 |
|------|------|--------|
| `docs/PRD.md` | 产品需求文档（Source of Truth） | Mark + 小P |
| `docs/WBS.md` | 开发任务工作分解结构 | 小P |
| `CONTRIBUTING.md` | 开发规范（本文件） | 小P |

> **重要：** `docs/BRS.md` 已更名为 `docs/PRD.md`，任务追踪已迁移至 `docs/WBS.md`。

---

## 3. 分支与 Commit 规范

**分支命名：**
```
feat/<功能简述>    # 示例：feat/forecast-period-api
fix/<问题简述>    # 示例：fix/approval-workflow
docs/<文档类型>   # 示例：docs/prd-update
```

**Commit 格式：**
```
<type>: <简短描述>

type: feat | fix | docs | refactor | test | chore
```

> 禁止空 commit，禁止无意义的 WIP commit。

---

## 4. PR 流程

```
分支开发 → commit → push → 创建 PR → Review → Mark 确认 → 合并到 master
```

> **Mark 说"推送 master"时，直接 push master，不走 PR 流程。**

### Review 分组

| 代码分组 | 负责人 | Review 责任人 |
|---------|--------|-------------|
| **小A组** | 小A | 吉文（Mark） |
| **小P组** | 小P | 吉文（Mark） |

### 合并规则

- 至少 **1 人 approve** 方可合并
- 各组完成开发与内部 Review 后提交 PR
- 小A 或 小P 通知吉文（Mark）进行最终 Approve 并合并

---

## 5. AI 代码规范

- **CC / Codex 生成的代码必须经过 Review 后才能合入**
- 禁止任何 AI 代码直接 push master（Mark 指令除外）
- 关键逻辑添加中文注释，新增函数注明输入输出

---

## 6. PRD 驱动开发模式

**核心原则：**
- `docs/PRD.md` — 产品需求文档，**需求功能的唯一事实来源**
- `docs/WBS.md` — 工作分解结构，**开发任务的触发和追踪入口**

开发任务的触发以 WBS 为准，任务内容（做什么功能）以 PRD 为准。

### 6.1 需求变更流程

```
Mark 更新 PRD（GitHub commit）
    ↓
Hermes（小P/小A）拉取 diff → 提取变更
    ↓
Hermes 更新 WBS 任务（新增/重排任务）
    ↓
Hermes 技术预研（可行性、风险）
    ↓
Hermes 跟 Mark 对齐技术方案（重要决策 Mark 拍板）
    ↓
CC 执行开发
    ↓
Hermes 调度 小Q 执行功能测试（Playwright + API）
    ↓
小Q 返回测试报告给 小P
    ↓
小P 验收（对比 PRD 原文）
    ↓
PR 合并
    ↓
小P 同步更新 WBS 任务状态
```

### 6.2 WBS 任务状态

WBS 文件（`docs/WBS.md`）记录所有开发任务和测试任务，格式：

```markdown
## 小P组任务
| T-001 | §4.1 | 登录模块 | ✅ 已验收 |

## 测试任务（由小Q执行）
| Q-001 | T-001/T-002 | 登录流程测试 | 🔄 待执行 |
```

**状态流转：** `🔄 待开发` → `🔄 开发中` → `✅ 已验收` → `✅ 已合并`

### 6.3 更新时机

| 场景 | 谁更新 | 更新什么 |
|------|--------|---------|
| Mark 提出新需求 | Mark | GitHub 直接编辑 `docs/PRD.md`，commit |
| 需求讨论完毕 | 小P | 修改 PRD，commit + push |
| 开发完成 | 小P | 调度小Q测试 → 更新 WBS 任务状态，commit + push |
| 小Q 测试完成 | 小P | 更新 WBS 测试任务状态，commit + push |
| PRD 有技术错误 | 小P | 通知 Mark 确认后修改 |

### 6.4 两组任务分配

| PRD 变更内容 | 默认负责组 |
|------------|---------|
| 预测填报、审批流程、核心业务逻辑 | 小P组 |
| Dashboard、图表、前端展示 | 小A组 |
| 用户管理、权限、基础数据 | 小A组 |
| 产品层级、数据导入脚本 | 小A组 |
| 跨模块改动 | Hermes 判断主责 |

### 6.5 小P变更感知

每次对话开始前，小P自动检查 `origin/master` 的 PRD commit log：
- 有新 commit → 提取 diff 内容
- 跟 Mark 确认理解是否正确
- 确认后分配给对应组的 CC 执行

---

## 7. 小Q测试调度流程

```
小P 验收开发成果
    ↓
小P 通过 delegate_task 调度小Q
    ↓
小Q 执行测试（Playwright API + UI）
    ↓
小Q 返回测试报告（PASS/FAIL 统计 + 详情）
    ↓
小P 决策：
  - PASS → 标记 WBS 任务 ✅，通知 Mark
  - FAIL → 打回 CC 修复，循环
```

**小Q 职责边界：**
- 只做测试，不做开发
- 由小P调度，不接受其他来源的指令
- 测试结果报告返回给小P，不直接通知 Mark

---

## 8. 快速开始

```bash
# 克隆
git clone https://github.com/jiwenmang1983/sandvik-sales-forecast-tool.git
cd sandvik-sales-forecast-tool

# 创建功能分支
git checkout -b feat/your-feature

# 提交并推送
git add .
git commit -m "feat: 你的功能描述"
git push origin feat/your-feature

# 在 GitHub 创建 PR，小A或小P通知吉文（Mark）Approve 合并
```
