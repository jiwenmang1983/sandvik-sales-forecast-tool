# 小Q Session 追踪

> Hermes 主动管理，每个 topic 对应一个 session，避免上下文污染

## 格式

```
TOPIC | SESSION_ID | LAST_UPDATED | 状态 | 说明
```

## 规则

- **新 topic** → 开新 session，登记
- **同一 topic 继续** → `--resume SESSION_ID`，更新时间
- **Topic 完成后** → 状态改成 `done`
- **超过 24h 未用** → 可视为 stale，开新 session

## 当前活跃 Session

```
TOPIC          | SESSION_ID           | LAST_UPDATED          | 状态  | 说明
(空)
```

## 已完成 Session

```
TOPIC | SESSION_ID | COMPLETED | 说明
(空)
```
