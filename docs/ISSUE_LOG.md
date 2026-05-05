# SFT Issue Log — 统一 Issue 追踪

> **用途：** 统一收录所有 Issue 类型——开发前逻辑缺口、运行时 Bug、API 路由问题
> **维护规则：** 所有 Issue 均记录于此，不得散落在其他文档中
> **更新：** 2026-05-05 — 62个逻辑缺口已全部通过 Q&A 确认

---

## 🟡 Issue 总览

|| 类型 | 数量 | 状态 |
|------|------|------|
| 🔴 Blocking — 已解决 | 44 | ✅ 2026-05-05 Q&A 会话全部确认 |
| 🟢 Non-blocking — 已解决 | 7 | ✅ 2026-05-05 Q&A 会话全部确认 |
| 🐞 运行时 Bug（来自 PRD §14 + 小Q新发现） | 11 | ⏳ 待修复（8个旧+3个新） |
| 🌐 API 路由问题（H-025测试发现） | 7 | ✅ 大部分已修复 |
| **合计** | **68** | |

---

## ✅ 已解决：开发前逻辑缺口（ISS-001 ~ ISS-050）

> 以下 Issue 来自 PRD_LOGIC_GAPS.md 的62个问题，已在 2026-05-05 Q&A 会话中全部确认。
> 确认结论已融入 PRD.md 各章节，ISSUE_LOG.md 作为确认记录保留。

### 🔴 Blocking — 已解决（44个）

| ID | 问题 | 结论摘要 | 确认来源 |
|----|------|---------|---------|
| ISS-001 | Q15: 同一销售同一周期同一客户同一产品能否产生多条记录？ | **唯一约束**：同一（销售+周期+客户+产品+月份）唯一一条，覆盖更新 | PRD §4.2 |
| ISS-002 | Q13: 填报数据校验规则 | 金额/数量>=0；不可为负；月度与年度无校验关系 | PRD §4.2 |
| ISS-003 | Q44: 记录唯一性/历史版本 | ApprovalHistory仅记录操作，不记录数据值，不可追溯 | PRD §4.3 |
| ISS-004 | Q16: 审批推进是自动还是手动？ | **自动推进**：通过后自动找上一级审批人继续流转 | PRD §4.3 |
| ISS-005 | Q17: 审批链节点不存在时？ | **自动跳过**：找到下一个有效审批人继续流转 | PRD §4.3 |
| ISS-006 | Q20: Frank Tao"不能改明细"是前端还是后端？ | **后端强制校验**：后端 API 层控制，前端不显示修改入口 | PRD §4.3 |
| ISS-007 | Q18: 退回层级逻辑 | **逐层退回**：直线经理→销售；不是跳级退回原点 | PRD §4.3 |
| ISS-008 | Q8: 首次进入填报页面默认状态 | **空白列表**+已填报条目数量/金额汇总 | PRD §4.2 |
| ISS-009 | Q31: 复制上期数据逻辑 | 复制后为**草稿状态**，需手动提交审批 | PRD §4.2 |
| ISS-010 | Q33: 填报月份列表如何生成 | 由周期定义的 period_start_year_month / period_end_year_month 控制 | PRD §3.2 |
| ISS-011 | Q35: 开票公司和客户是否关联 | **完全无关**：开票公司自由选择，无品牌/区域限制 | PRD §5.3 |
| ISS-012 | Q36: 数量精度和汇率处理 | 金额单位为元（整数），数量为整数，不涉及币种 | PRD §4.2 |
| ISS-013 | Q37: 品牌过滤 WHERE 层还是 API 层？ | **后端 SQL 层强制执行**：`Salesperson.Brand = Customer.Brand` | PRD §5.2 |
| ISS-014 | Q38: 直线经理"团队数据"的递归深度 | **无限制**：递归遍历所有下属节点 | PRD §5.2 |
| ISS-015 | Q40: OrgNode树的数据结构和性能 | `parent_id` 自引用，固定4层，递归 CTE 性能无问题 | PRD §5.2 |
| ISS-016 | Q41: 跨部门特别权限和审批链权限优先级 | 先检查开票公司特别权限表，再走 OrgNode 层级递归 | PRD §5.2 |
| ISS-017 | Q26: Dashboard各角色数据范围 | 销售仅自己；直线经理本团队；CEO全量 | PRD §4.1 |
| ISS-018 | Q27: Dashboard客户维度汇总口径 | sum(order_amount)，仅已审批通过数据 | PRD §4.1 |
| ISS-019 | Q32: 草稿提交后状态变化 | 原记录状态变更，**不新建记录** | PRD §3.3 |
| ISS-020 | Q34: 业绩归属区域/销售大区自动带出时机 | **实时查 OrgNode**，登录时取 Session 均可 | PRD §5.3 |
| ISS-021 | Q42: 删除客户/产品/周期时预测记录处理 | **软删除**：is_deleted，历史数据保留展示 | PRD §6 |
| ISS-022 | Q43: ApprovalRequest和ApprovalHistory关系 | 一个 Request 对应多条 History（多轮审批/退回均记录） | PRD §6 |
| ISS-023 | Q45: 软删除统一拦截 | EF Core BaseEntity 全局 `HasQueryFilter(is_deleted=0)` | PRD §6 |
| ISS-024 | Q46: 创建预测记录+触发审批流是否同事务 | 不做强事务，审批流失败不阻止记录创建 | PRD §6 |
| ISS-025 | Q19: 退回次数是否有限制 | **无限制**：可反复退回调整直到达成一致 | PRD §4.3 |
| ISS-026 | Q47: 首次SSO登录但系统无记录时 | **返回错误**：账号必须预先存在于系统，不自动创建 | PRD §9 |
| ISS-027 | Q49: 同一用户能否多设备同时登录 | **不可**：多设备互斥，一处登录其他设备被踢出 | PRD §9 |
| ISS-028 | Q50: 开发/生产环境登录切换 | **环境变量**：`ASPNETCORE_ENVIRONMENT=Development` 走 JWT | PRD §9 |
| ISS-029 | Q51: 选PA后清空Sub PA-2/3/4？ | **是**：任一级变化时，其下级清空重选（SubPA1变化SubPA2保持） | PRD §10.3 |
| ISS-030 | Q52: 产品搜索能力 | **模糊搜索**：左右模糊匹配，支持按俗称搜到规范名称 | PRD §10.3 |
| ISS-031 | Q53: 8大产品线是预置还是手工？ | **上线初始化**：统一提供文件导入，支持增量更新 | PRD §10.5 |
| ISS-032 | Q54: import_product_hierarchy.py 全量还是增量？ | **全量覆盖**：流水号（产品编码）不变 | PRD §10.5 |
| ISS-033 | Q55: 邮件触发时机 | **立即写入队列表**：`email_queue_items`，邮件服务实时轮询推送 | PRD §8.3 |
| ISS-034 | Q56: 模板变量渲染时机 | **预渲染策略**：提交时渲染好内容存入队列表，发送时直接推送 | PRD §8.3 |
| ISS-035 | Q57: 邮件发送失败后是否有其他通知手段 | **暂不做**：仅邮件通知，不涉及站内通知/管理员通知 | PRD §8.3 |
| ISS-036 | Q58: 审计日志覆盖范围 | 记录所有操作（登录/增/删/改/查），仅管理员可查看 | PRD §8.3 |
| ISS-037 | Q59: 统一错误码体系 | ErrorCode.cs：1xxx/2xxx/3xxx/4xxx + AppException + 全局Middleware | PRD §8.3 |
| ISS-038 | Q61: 预测数据版本管理 | 草稿状态下反复修改**无版本历史**，提交后状态变更 | PRD §4.2 |
| ISS-039 | Q62: /health端点 | 已实现：前后端分离，单体API部署，实现此端点即可 | PRD §8.2 |
| ISS-040 | Q3: 预测月份范围边界 | start=2026-01, end=2026-01 = **1个月**（闭区间） | PRD §3.2 |
| ISS-041 | Q23: 审批撤回/撤销 | **不可撤回**：提交后只能等上一级审批人主动驳回 | PRD §4.3 |
| ISS-042 | Q24: 审批历史查询性能 | ApprovalHistory 表设计已考虑索引，周期数据量级无性能问题 | PRD §4.3 |
| ISS-043 | Q21: 调整后重新提交流程 | 退回到被退回那级，**不回到最底层重新发起** | PRD §4.3 |
| ISS-044 | Q1补充: 当前周期如何确定 | **按时间窗口自动确定**（FillTimeStart/End），同一时间唯一有效周期 | PRD §3.1 |

### 🟢 Non-blocking — 已解决（7个）

| ID | 问题 | 结论摘要 | 确认来源 |
|----|------|---------|---------|
| ISS-045 | Q14: 被退回后是否立刻可编辑？ | 退回后即可编辑，无需等审批流结束 | PRD §4.3 |
| ISS-046 | Q22: 批量审批能力 | 第一期不做，后续迭代考虑 | PRD §4.3 |
| ISS-047 | Q28: Dashboard数据统计口径和刷新频率 | 非blocking，暂不规定刷新频率 | PRD §4.1 |
| ISS-048 | Q29: 空状态和加载状态显示 | 非blocking，统一用骨架屏+空态插图 | PRD_DETAILED_SPEC |
| ISS-049 | Q39: 草稿状态下的权限边界 | 草稿仅提交人可见，审批人看不到草稿数据 | PRD §5.2 |
| ISS-050 | Q48: SSO Token刷新策略 | 非blocking，后续迭代考虑 HttpOnly Cookie | PRD §9 |
| ISS-051 | Q60: 移动端/响应式适配 | 第一期不做，后续迭代考虑 | PRD §4.1 |

---

## 🐞 运行时 Bug（来自原 PRD §14）

> 迁移自 PRD.md v0.2 §14，2026-05-05 整理

|| # | 问题 | 优先级 | 状态 | 备注 |
|--|---|------|--------|------|------|
|| BUG-01~13 | Dashboard 页面空白（Mock 数据） | P2 | ⏳ 待修复 | 需对接真实 API |
|| BUG-04 | Forecast 填报按钮无反应 | P1 | ✅ 已修复 | |
|| BUG-06 | Forecast 填报按钮无功能 | P1 | ✅ 已修复 | |
|| BUG-14 | 路由空白页 | P0 | ✅ 已修复 | |
|| BUG-15 | 登录无反应 | P1 | ✅ 已修复 | |
|| BUG-16 | Approval 页面崩溃 | P1 | ✅ 已修复 | |
|| BUG-17 | Forecast 周期列表使用 Mock 数据 | P2 | ⏳ 待修复 | 需对接真实 API |
|| BUG-18 | 字段名不匹配（orderAmount vs Amount） | P1 | ✅ 已修复 | |

---

## 🐞 测试中新发现 Bug（2026-05-05 小Q测试）

> 以下 Bug 由小Q在 Q-001~Q-004 测试执行中新发现，待 CC 修复

|| Bug ID | 问题 | API 证据 | 状态 | 备注 |
|--------|------|---------|------|------|
|| BUG-019 | `GET /api/invoice-companies` 返回 404，InvoiceCompany 端点缺失 | curl → HTTP 404 | ✅ 已修复（commit 5a82d54）| 新增InvoiceCompanyController，list+detail端点，!IsDeleted+IsActive过滤 |
|| BUG-020 | `PUT /api/forecast-periods/{id}` 全字段必填，未实现 PATCH 部分更新 | 字段缺失 → HTTP 400 | ✅ 已修复（commit 5a82d54）| PatchPeriodRequest DTO，nullable字段，部分更新 |
|| BUG-021 | `GET /api/forecast/records` 不过滤 `isDeleted=true` 的记录 | 查询结果含已删除记录 | ✅ 已修复（commit 5a82d54）| SandvikDbContext HasQueryFilter 修复，entityType.ClrType参数 |

---

## 🌐 API 路由问题（H-025 xiaoQ 测试发现）

> xiaoQ 执行 H-025 API 端点测试时发现，2026-05-04

### API 路由错误/不存在（6个）
| ID | 问题 | 修复建议 | 状态 |
|----|------|---------|------|
| API-052 | `/api/forecast/cycles` → 404 | 正确路由是 `/api/forecast/periods` | ✅ 已修复 |
| API-053 | `/api/customers` → 404 | 正确路由是 `/api/basedata/customers` | ✅ 已修复 |
| API-054 | `/api/salespersons` → 404 | 端点不存在，应用 `/api/org/members` 作为替代 | ✅ 已修复 |
| API-055 | `/api/regions` → 404 | 端点不存在，应用 `/api/org/chart` 作为替代 | ✅ 已修复 |
| API-056 | `/api/org-nodes` → 404 | 正确路由是 `/api/org/nodes`（仅支持POST创建） | ✅ 已修复 |
| API-057 | `/api/approval-flow/history/{id}` → 404 | 正确路由是 `/api/approval-flow/{id}/history` | ✅ 已修复 |

### API 参数问题（1个）
| ID | 问题 | 修复建议 | 状态 |
|----|------|---------|------|
| API-058 | `/api/forecast/submit` 文档参数名错误 | 参数是 `PeriodId` 不是 `forecastRecordId` | ✅ 已修复 |
| **BUG-022** | **API统一响应格式缺失** | 所有端点返回扁平数组，未按PRD §4.4.3规范返回 `{code,data,message}` 结构。证据：GET /api/forecast-periods → `[{id,fcName...}]` 而非 `{code:0,data:[...]}` | 🔄待修复 |
| **BUG-023** | **Dashboard API缺失** | GET /api/dashboard → 404 | 🔄待修复 |
| **BUG-024** | **组织节点API缺失** | GET /api/basedata/org-nodes → 404 | 🔄待修复 |
| **BUG-025** | **登出API缺失** | POST /api/auth/logout → 404 | 🔄待修复 |

---

*本文档由 Hermes 小P 维护，最后更新：2026-05-05 17:51（BUG-022~025新增自Q-FW1探测）*
