# Sandvik Sales Forecast Tool — Contributing Guide

> 本项目（SFT）所有开发人员必须遵循本文档规范。
> 仓库地址：https://github.com/jiwenmang1983/sandvik-sales-forecast-tool
> 正式开发分支：`master`

---

## 1. 团队角色

| 角色 | 姓名 | 职责 |
|------|------|------|
| **最终审批人** | Mark | 确认并批准 PR 合并 |
| **PM / 产品负责人** | Hermes（小P） | 需求拆解、调度 CC 开发 B 组代码、Review A 组代码 |
| **PM** | 小A | Review 所有 PR，通知 Mark 进行合并确认 |
| **助理** | — | 调度 Codex 开发 A 组前端代码 |
| **后端开发** | Claude Code (CC) | B 组后端 / 基础设施实现（Hermes 调度） |
| **前端开发** | Codex | A 组前端 / 业务逻辑实现（助理调度） |
| **代码审查** | 吉文 | Review B 组（后端）代码 |

---

## 2. 分支管理

### 分支命名
```
feat/<功能简述>
fix/<问题简述>
docs/<文档类型>
```

示例：
```
feat/forecast-period-api      # 预测周期管理 API
fix/approval-workflow        # 审批流程 Bug
docs/brs-update             # BRS 文档更新
```

### 分支策略
- **`master`** — 正式开发分支，始终可部署，所有代码最终合入此分支
- **`feature/xxx`** — 新功能开发分支
- **`fix/xxx`** — Bug 修复分支
- **`docs/xxx`** — 文档更新分支

---

## 3. Commit 规范

```
<type>: <简短描述>

type: feat | fix | docs | refactor | test | chore
```

示例：
```
feat: 预测周期管理页面对接真实 API
fix: 修复审批提交空指针异常
docs: 更新 BRS 需求说明书
```

**规则：禁止空 commit，禁止提交无意义的 WIP commit。**

---

## 4. PR 流程

```
分支开发 → commit → push → 创建 PR → Review → Mark 确认 → 合并到 master
```

### 4.1 PR 创建规范

每个 PR 必须包含：

| 字段 | 说明 |
|------|------|
| **标题** | `<type>: <改动简述>` |
| **描述** | 改了什么、为什么改、怎么测试的 |
| **Reviewers** | 按分组指定至少 1 人 |
| **Labels** | `feat` / `fix` / `docs` 等 |

### 4.2 Review 分组

| 代码分组 | 内容 | 代码实现 | Review 责任人 |
|---------|------|---------|-------------|
| **A组** | 前端 / 业务逻辑 | Codex（助理调度） | **Hermes** |
| **B组** | 后端 / 基础设施 | CC（Hermes调度） | **吉文** |

### 4.3 合并规则

- 至少 **1 人 approve** 方可合并
- A组 PR → Hermes Review → 小A 通知 Mark → Mark 确认合并
- B组 PR → 吉文 Review → 小A 通知 Mark → Mark 确认合并
- CI 必须通过
- 合入后删除源分支

---

## 5. AI 代码规范

- **CC** 生成的代码必须经过 Review 才能合入
- **Codex** 生成的代码必须经过 Review 才能合入
- **禁止任何 AI 代码直接 push 到 master**
- 关键逻辑必须添加中文注释
- 新增函数须注明输入输出

---

## 6. 禁止事项

- ❌ AI 代码直接 push master
- ❌ 未经 Review 直接合并 PR
- ❌ force push master 分支
- ❌ 在 master 直接提交（所有改动走 PR）

---

## 7. 目录结构

```
sandvik-sales-forecast-tool/
├── backend/                    # 后端 (.NET)
│   └── src/
│       ├── SandvikForecast.Core/       # Entity / Domain
│       ├── SandvikForecast.Infrastructure/ # Data / Repository
│       └── SandvikForecast.Api/        # API / Controller / Service
├── frontend/                   # 前端 (Vue 3)
│   └── src/
│       ├── views/             # 页面组件
│       ├── components/         # 公共组件
│       └── router/            # 路由
├── docs/                      # 文档
│   ├── BRS_v0.1.md           # 需求规格说明书
│   ├── PRD_REVIEW_WORKFLOW.md # 协作流程
│   └── 02-数据库设计.md       # 数据库设计
├── CONTRIBUTING.md            # 本文件
└── README.md
```

---

## 8. 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/jiwenmang1983/sandvik-sales-forecast-tool.git
cd sandvik-sales-forecast-tool

# 2. 确保在 master 分支
git checkout master
git pull origin master

# 3. 创建功能分支
git checkout -b feat/your-feature

# 4. 开发 & 提交
git add .
git commit -m "feat: 你的功能描述"
git push origin feat/your-feature

# 5. 在 GitHub 创建 PR，指定 Reviewer
# A组代码 → 指定 Hermes review
# B组代码 → 指定 吉文 review

# 6. Review 通过后，小A 通知 Mark
# 7. Mark 确认合并 → PR 合并到 master
```
