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

## 5. 快速开始

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
