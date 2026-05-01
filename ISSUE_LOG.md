# Sandvik Forecast Tool — Issue Log

> Last Updated: 2026-05-02
> Owner: Hermes (PM) | Developer: Claude Code | Tester: Hermes + Subagents

---

## 📋 Open Issues

| # | Title | Severity | Status | Assigned | Notes |
|---|-------|----------|--------|----------|-------|
| 1 | Logout 后不跳转到 Login 页面 | P2 | Open | CC | 点击 logout 后停留在当前页，未跳转 /login |
| 2 | Login 页面缺少本地测试登录入口 | P2 | Resolved | CC+Hermes | 已添加本地登录表单 + Mark 测试账号 |
| 3 | 本地登录走真实 API + Mark 账号 | P1 | Resolved | Hermes | 后端已支持邮箱登录，密码 Password123 |
| 4 | Forecast 填报页面按钮全部无功能 | P1 | Open | CC | 下载模板/下载数据/导入/复制上期/新增行/保存草稿/提交审批 按钮均无 click handler |
| 5 | Dashboard 所有数据是 Mock | P1 | Open | CC | 全部图表和指标数据使用 mockData，需对接真实 API |
| 6 | BaseData 基础数据增删改全是 Mock | P1 | Open | CC | 产品/客户/区域/人员 CRUD 只有本地状态，无 API 对接 |
| 7 | FcVersion 预测周期管理全是 Mock | P2 | Open | CC | 版本列表增删改查只有本地状态 |
| 8 | Users 用户管理全是 Mock | P2 | Open | CC | 用户增删改只有本地状态 |
| 9 | OrgChart 组织架构全是 Mock | P2 | Open | CC | 增删改节点只有本地状态 |
| 10 | Permissions 权限管理全是 Mock | P2 | Open | CC | 权限保存只有本地状态 |
| 11 | SystemLog 系统日志全是 Mock | P2 | Open | CC | 日志只有本地 mock 数据 |
| 12 | LoginLog 登录日志全是 Mock | P2 | Open | CC | 日志只有本地 mock 数据 |
| 13 | ApprovalFlow 审批流程配置全是 Mock | P2 | Open | CC | 流程增删改只有本地状态 |
| 14 | **路由未注册导致 13 个页面空白** | P0 | Open | CC | router/index.js 只有 /dashboard 和 /login，其他所有菜单路由均未注册 |
| 15 | **本地登录表单提交无反应** | P1 | Open | CC | 表单数据绑定问题，用户选择值未写入表单，@finish 未触发 |
| 16 | **Approval.vue 渲染失败导致空白页** | P1 | Open | CC | 访问 /approval 路由时 Vue 组件未渲染，整个应用 DOM 异常 |

---

## ✅ Resolved Issues

| # | Title | Severity | Status | Resolved | Notes |
|---|-------|----------|--------|----------|-------|
| — | — | — | — | — | — |

---

## 🔍 Test Results Summary (2026-05-02)

### 登录模块（Subagent A）
| 测试用例 | 预期 | 实际 | 结果 |
|---------|------|------|------|
| 本地登录表单提交 | 跳转 Dashboard | 页面停留 /login，无反应 | FAIL |
| SSO 登录 | 跳转 Dashboard | 跳转成功 | PASS |
| Logout 跳转 | 跳转 /login | 停留在当前页 | FAIL |

**新发现 Issue #15:** 表单数据绑定问题 — 用户选择器的值未正确写入表单，`onsubmit` 和 `onclick` 均为 null（Vue 事件绑定可能失效）

### Dashboard + 导航（Subagent B）
| 菜单 | 路由 | 结果 | 说明 |
|------|------|------|------|
| Dashboard | /#/dashboard | PASS | 正常但全为 Mock |
| 销售填报预测填报 | /#/sales-forecast | FAIL | 空白页，路由未注册 |
| 销售预测审核 | /#/sales-review | FAIL | 空白页，路由未注册 |
| 分析报表 | /#/reports | FAIL | 空白页，路由未注册 |
| 组织架构 | /#/organization | FAIL | 空白页，路由未注册 |
| 客户信息 | /#/customers | FAIL | 空白页，路由未注册 |
| 产品库 | /#/products | FAIL | 空白页，路由未注册 |
| 数据字典 | /#/dictionary | FAIL | 空白页，路由未注册 |
| 用户账号管理 | /#/users | FAIL | 空白页，路由未注册 |
| 角色和权限管理 | /#/roles | FAIL | 空白页，路由未注册 |
| 预测周期管理 | /#/periods | FAIL | 空白页，路由未注册 |
| 系统登录日志 | /#/login-logs | FAIL | 空白页，路由未注册 |
| 系统操作日志 | /#/audit-logs | FAIL | 空白页，路由未注册 |
| 审批流程配置 | /#/approval-flow | FAIL | 空白页，路由未注册 |

**新发现 Issue #14:** 根本原因 — `router/index.js` 只注册了 `/dashboard` 和 `/login`，其他 13 个路由均未配置

### 审批 + 基础数据（Subagent D）
| 页面 | 结果 | 说明 |
|------|------|------|
| Dashboard | PASS | Mock 数据 |
| 销售预测审核 /approval | FAIL | 空白页，Vue 组件未渲染（Issue #16） |
| 产品库 /products | BLOCKED | 被 Issue #16 阻塞 |
| 客户信息 /customers | BLOCKED | 被 Issue #16 阻塞 |
| 组织架构 /org | BLOCKED | 被 Issue #16 阻塞 |
| 数据字典 /datadict | BLOCKED | 被 Issue #16 阻塞 |
| 预测周期管理 /fc-version | BLOCKED | 被 Issue #16 阻塞 |

**新发现 Issue #16:** `Approval.vue` 组件加载/渲染异常，导致整个应用在访问该路由时 DOM 只剩空注释 `<!---->`

### Forecast 填报（Subagent C）
| 按钮 | 结果 | 说明 |
|------|------|------|
| 所有按钮 | 未测试 | 被路由/组件问题阻塞 |

---

## 📝 Issue Template

```
### #[ID] — [Title]
**Severity:** P0(Critical) / P1(High) / P2(Medium) / P3(Low)
**Status:** Open → In Progress → Testing → Resolved / Won't Fix
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD
**Description:**

**Root Cause:**

**Fix:**

**Test Verification:**
- [ ]
```

---

## 🗺️ Priority Map

```
P0 (Critical - 阻断一切):
  #14 路由未注册（13个页面空白）

P1 (High - 功能不可用):
  #15 本地登录表单无反应
  #16 Approval.vue 渲染失败
  #4  Forecast 填报按钮无功能
  #5  Dashboard 全 Mock
  #6  BaseData CRUD 全 Mock

P2 (Medium - 体验问题):
  #1  Logout 不跳转
  #7-#13 其他模块 Mock 数据
```

---

*Log managed by Hermes Agent*
