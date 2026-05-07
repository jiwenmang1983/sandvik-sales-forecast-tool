# 小Q & CC 状态追踪

> Hermes 主动管理，任务不丢、上下文不断

---

## CC 状态

| 项目 | 值 |
|------|-----|
| tmux session | cc-sandvik |
| 状态 | 🟢 存活 / 🔴 已断开 |
| 当前分支 | bugfix/phase2-bugs |
| 当前任务 | — |
| 最后活动时间 | — |

**CC 任务队列**

| # | 任务 | 状态 | 开始时间 |
|---|------|------|---------|
| — | — | — | — |

**判断死活：** `tmux has-session -t cc-sandvik`

---

## 小Q Session（SQLite，--resume SESSION_ID 续接）

**规则：**
- 新 topic → 开新 session，登记
- 同一 topic 继续 → `--resume SESSION_ID`，更新时间
- 超过 24h 未用 → stale，开新 session

**当前活跃 Session**

| TOPIC | SESSION_ID | LAST_UPDATED | 状态 | 说明 |
|-------|------------|-------------|------|------|
| — | — | — | — | — |

**已完成 Session**

| TOPIC | SESSION_ID | COMPLETED | 说明 |
|-------|------------|-----------|------|
| — | — | — | — |
