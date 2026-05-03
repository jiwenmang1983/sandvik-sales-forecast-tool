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

两组均为全栈，不区分前端后端。

---

## 2. 分支与 Commit 规范

**分支命名：**
```
feat/<功能简述>    # 示例：feat/forecast-period-api
fix/<问题简述>    # 示例：fix/approval-workflow
docs/<文档类型>   # 示例：docs/brs-update
```

**Commit 格式：**
```
<type>: <简短描述>

type: feat | fix | docs | refactor | test | chore
```

> 禁止空 commit，禁止无意义的 WIP commit。

---

## 3. PR 流程

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

## 4. AI 代码规范

- **CC / Codex 生成的代码必须经过 Review 后才能合入**
- 禁止任何 AI 代码直接 push master（Mark 指令除外）
- 关键逻辑添加中文注释，新增函数注明输入输出

---

## 5. BRS 驱动开发模式

**核心原则：** `docs/BRS.md` 是唯一事实来源（Source of Truth），所有开发任务对齐 BRS。

### 5.1 需求变更流程

```
Mark 更新 BRS（GitHub commit）
    ↓
Hermes（小P/小A）拉取 diff → 提取变更
    ↓
Hermes 技术预研（可行性、风险）
    ↓
Hermes 跟 Mark 对齐技术方案（重要决策 Mark 拍板）
    ↓
CC 执行开发
    ↓
Hermes 验收（对比 BRS 原文）
    ↓
PR 合并
    ↓
Hermes 同步更新 BRS 任务状态
```

### 5.2 BRS 任务状态

BRS 文件内嵌任务状态表（见 `docs/BRS.md` → `## 开发任务（Task Tracker）`），格式：

```markdown
| 任务ID | 功能模块 | 任务描述 | 负责组 | 状态 | 备注 |
|--------|---------|---------|--------|------|------|
| T-001  | §4.1    | 登录模块 | 小P组 | ✅ 已验收 | |
| T-002  | §4.2    | 产品5级联动 | 小P组 | 🔄 开发中 | |
```

**状态流转：** `🔄 待开发` → `🔄 开发中` → `✅ 已验收` → `✅ 已合并`

### 5.3 更新时机

| 场景 | 谁更新 BRS | 如何更新 |
|------|-----------|---------|
| Mark 提出新需求 | Mark | GitHub 直接编辑 `docs/BRS.md`，commit |
| 需求讨论完毕 | Hermes | 修改 BRS，commit + push |
| 开发完成 | Hermes | 更新任务状态（✅），commit + push |
| BRS 有技术错误 | Hermes | 通知 Mark 确认后修改 |

### 5.4 两组任务分配

| BRS 变更内容 | 默认负责组 |
|------------|---------|
| 预测填报、审批流程、核心业务逻辑 | 小P组 |
| Dashboard、图表、前端展示 | 小A组 |
| 用户管理、权限、基础数据 | 小A组 |
| 产品层级、数据导入脚本 | 小A组 |
| 跨模块改动 | Hermes 判断主责 |

### 5.5 Hermes 变更感知

每次对话开始前，Hermes 自动检查 `origin/master` 的 BRS commit log：
- 有新 commit → 提取 diff 内容
- 跟 Mark 确认理解是否正确
- 确认后分配给对应组的 CC 执行

---

## 6. 快速开始

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
