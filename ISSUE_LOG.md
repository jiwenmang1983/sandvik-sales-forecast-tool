# Sandvik Forecast Tool — Issue Log

> Last Updated: 2026-01-01
> Owner: Hermes (PM) | Developer: Claude Code | Tester: Hermes

---

## 📋 Open Issues

| # | Title | Severity | Status | Assigned | Notes |
|---|-------|----------|--------|----------|-------|
| 1 | Logout 后不跳转到 Login 页面 | P2 | Testing | CC | 点击 logout 后停留在当前页面，未跳转 /login |
| 2 | Login 页面缺少本地测试登录入口 | P2 | Resolved | CC+Hermes | 已添加本地登录表单 + Mark 测试账号 |
| 3 | 本地登录走真实 API + Mark 账号 | P1 | Resolved | Hermes | 后端已支持邮箱登录，Mark 账号已创建，密码 Password123 |
| 4 | Forecast 填报页面按钮全部无功能 | P1 | In Progress | CC | 下载模板/下载数据/导入/复制上期/新增行/保存草稿/提交审批 按钮均无 click handler |
| 5 | Dashboard 所有数据是 Mock | P1 | Pending | CC | 全部图表和指标数据使用 mockData，需对接真实 API |
| 6 | BaseData 基础数据增删改全是 Mock | P1 | Pending | CC | 产品/客户/区域/人员 CRUD 只有本地状态，无 API 对接 |
| 7 | FcVersion 预测周期管理全是 Mock | P2 | Pending | CC | 版本列表增删改查只有本地状态 |
| 8 | Users 用户管理全是 Mock | P2 | Pending | CC | 用户增删改只有本地状态 |
| 9 | OrgChart 组织架构全是 Mock | P2 | Pending | CC | 增删改节点只有本地状态 |
| 10 | Permissions 权限管理全是 Mock | P2 | Pending | CC | 权限保存只有本地状态 |
| 11 | SystemLog 系统日志全是 Mock | P2 | Pending | CC | 日志只有本地 mock 数据 |
| 12 | LoginLog 登录日志全是 Mock | P2 | Pending | CC | 日志只有本地 mock 数据 |
| 13 | ApprovalFlow 审批流程配置全是 Mock | P2 | Pending | CC | 流程增删改只有本地状态 |

---

## ✅ Resolved Issues

| # | Title | Severity | Status | Resolved | Notes |
|---|-------|----------|--------|----------|-------|
| — | — | — | — | — | — |

---

## 📝 Issue Template

```
### #[ID] — [Title]
**Severity:** P0(Pritical) / P1(High) / P2(Medium) / P3(Low)
**Status:** Open → In Progress → Testing → Resolved / Won't Fix
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD
**Description:**
> 

**Root Cause:**

**Fix:**

**Test Verification:**
- [ ] 
```

---

*Log managed by Hermes Agent*
