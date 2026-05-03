# Sandvik Sales Forecast Tool — Contributing Guide

## 开发团队

| 团队 | 成员 | 职责 |
|------|------|------|
| **A组** | 吉文 + 助理(我) + Codex | 功能开发、代码实现 |
| **B组** | hermes(PM) + Claude Code | 产品需求、PRD输出 |

---

## 代码管理规范

### 1. 分支模型：GitHub Flow（简化版）

```
main ─────────────────────────────────────── 始终可部署
       ↖ PR#1        ↖ PR#2
feat/xxx ──── 开发完成 → PR → review → 合并
```

- **main** — 稳定分支，始终可部署
- **feat/xxx** — 功能分支，每人用自己的分支
- **docs/xxx** — 文档分支
- **fix/xxx** — 修复分支

### 2. 分支命名规范

```
feat/<功能简述>-<负责人>
fix/<问题简述>-<负责人>
docs/<文档类型>-<负责人>
```

示例：
```
feat/forecast-chart-jw        # A组 - 预测图表
feat/user-auth-hm             # B组 - 用户认证
fix/login-bug-jw              # A组 - 登录bug修复
docs/api-spec-hm              # B组 - API文档
```

### 3. Commit 规范

```
<type>: <简短描述>

type: feat | fix | docs | refactor | test | chore
```

示例：
```
feat: 添加预测图表导出功能
fix: 修复登录页面白屏问题
docs: 更新API接口文档
```

---

## PR 流程

### 提 PR 规范

每个 PR 必须包含：

| 字段 | 说明 |
|------|------|
| **标题** | `<type>: <改动简述>` |
| **描述** | 改了什么、为什么改、怎么测的 |
| ** reviewers** | 指定至少 1 人 review |
| **labels** | `feat` / `fix` / `docs` 等 |

### Review 规则

- **A组代码** → 由 B组 (hermes) review
- **B组代码** → 由 A组 (吉文) review
- 助理(我) 做自动化检查（格式、lint、测试）
- **至少 1 人 approve** 才能合并
- CI 必须通过

### 合并后

- 删除源分支
- main 自动部署（或触发部署流程）

---

## 任务协作流程

### 任务分配

1. **hermes(PM)** 出 PRD / 需求文档
2. **助理(我)** 拆任务、估工时、排期
3. 双方各自领任务
4. 领任务者在对应分支开发

### 任务看板（GitHub Projects）

```
ToDo → In Progress → In Review → Done
```

---

## AI 辅助开发规范

### Codex / Claude Code 使用

- **我调度 Codex** 执行 A组代码实现
- **hermes调度 Claude Code** 执行 B组代码实现
- 生成的代码必须经过 review 才能合并
- 不允许 AI 生成的代码直接 push 到 main

### 代码质量

- 关键逻辑必须有中文注释
- 新增函数要写清楚输入输出
- 禁止提交空 commit 或 WIP commit

---

## 目录结构

```
sandvik-sales-forecast-tool/
├── app.js                    # 核心业务逻辑
├── index.html                # 主入口
├── styles.css
├── lib/                      # 第三方库
├── docs/                     # 文档（API、设计等）
├── screenshots/              # 截图
├── tests/                    # 测试用例（后续添加）
├── CONTRIBUTING.md           # 本文件
└── README.md
```

---

## 快速开始

```bash
# clone 项目
git clone https://github.com/jiwenmang1983/sandvik-sales-forecast-tool.git
cd sandvik-sales-forecast-tool

# 创建功能分支
git checkout -b feat/your-feature

# 开发完成后提交
git add .
git commit -m "feat: your feature"
git push origin feat/your-feature

# 在 GitHub 提 PR，等待 review
```
