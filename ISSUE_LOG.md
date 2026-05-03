# Sandvik Forecast Tool — Issue Log

> Last Updated: 2026-05-04
> Owner: Hermes (PM) | Developer: Claude Code | Tester: Hermes + Subagents
> **Scope: Only test defects (bugs, unexpected behavior) — NOT development tasks**

---

## 📋 Open Issues

| # | Title | Severity | Status | Assigned | Notes |
|---|-------|----------|--------|----------|-------|
| 1 | Logout 后不跳转到 Login 页面 | P2 | Open | CC | 点击 logout 后停留在当前页，未跳转 /login |
| 15 | 登录表单提交无反应 | P1 | Open | CC | 用户选择器的值未写入表单，onsubmit/onclick 均为 null，Vue 事件绑定失效 |
| 16 | Approval.vue 渲染失败导致空白页 | P1 | Open | CC | 访问 /approval 路由时组件未渲染，整个应用 DOM 异常 |

---

## ✅ Resolved Issues

| # | Title | Severity | Status | Resolved | Notes |
|---|-------|----------|--------|----------|-------|
| 2 | Login 页面缺少本地测试登录入口 | P2 | Resolved | CC+Hermes | 已添加本地登录表单 + Mark 测试账号 |
| 3 | 本地登录走真实 API + Mark 账号 | P1 | Resolved | Hermes | 后端已支持邮箱登录，密码 Password123 |
| 14 | 路由未注册导致 13 个页面空白 | P0 | Resolved | CC | router/index.js 现含 18 条路由，所有页面均可访问 |

---

## 🔍 Test Results Summary

### 登录模块（2026-05-02）

| 测试用例 | 预期 | 实际 | 结果 |
|---------|------|------|------|
| 本地登录表单提交 | 跳转 Dashboard | 页面停留 /login，无反应 | FAIL → Issue #15 |
| SSO 登录 | 跳转 Dashboard | 跳转成功 | PASS |
| Logout 跳转 | 跳转 /login | 停留在当前页 | FAIL → Issue #1 |

### 导航 + 路由（2026-05-02）

| 菜单 | 路由 | 结果 | 说明 |
|------|------|------|------|
| Dashboard | /#/dashboard | PASS | 正常但全为 Mock |
| 其余 13 个菜单 | 各自路由 | FAIL | 路由未注册 → Issue #14 **已修** |

### 审批 + 基础数据（2026-05-02）

| 页面 | 结果 | 说明 |
|------|------|------|
| 销售预测审核 /approval | FAIL | 组件未渲染 → Issue #16 |
| 产品库/客户/组织架构/数据字典/预测周期 | BLOCKED | 被 Issue #16 阻塞 |

---

*Log managed by Hermes Agent*
