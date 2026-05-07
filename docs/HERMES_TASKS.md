# Hermes 小P 任务管理表

> Hermes 任务状态机
> - `🔄 待处理` = 新任务，还没开始
> - `⏳ 等待中` = 委派出去了（CC/小Q），等结果
> - `🔬 进行中` = Hermes 自己正在做
> - `✅ 完成` = 已完成
> - `🚫 阻塞` = 依赖未满足，等 Mark

## 任务流转规则
1. Hermes 主动更新任务状态，不等 cron job
2. CC/小Q 任务**委派后立即标 ⏳ 等待中**，不移到⏳区块不开始计时
3. CC/小Q 任务**完成后立即标 ✅**
4. cron job 只负责检测 ⏳ 状态的任务是否完成，并更新状态
5. 阻塞任务由 Mark 解开后手动激活
6. 完成的任务保留 2 天后归档（昨天+今天）
7. 🚫 阻塞只阻塞自己，不阻塞其他任务（除非明确依赖）

---

## ⏳ 等待中

|| 任务ID | 描述 | 类型 | 优先级 | 依赖 | 委派时间 | 状态 | 备注 |
||--------|------|------|--------|------|---------|------|------|
|| H-061 | F-10-5: 用户-开票公司权限配置页面 | CC | P2 | H-060 ✅ | 2026-05-06 14:30 | ⏳ | CC proc_d61befbd6d00，UserInvoicePermission.vue+API封装+路由注册 |

---

## 🔄 待处理

### 第2轮：F-05 客户管理 + F-06 产品管理 + F-10 开票公司

| 任务ID | 描述 | 类型 | 优先级 | 依赖 | 创建时间 | 状态 | 备注 |
|--------|------|------|--------|------|---------|------|------|
| H-054 | F-05-1: customers表软删除（改硬删为软删） | CC | P0 | 无 | 2026-05-06 08:30 | ✅ | commit 7458cba，POST/PUT/DELETE+DTO+软删cascade |
| H-055 | F-05-6: 客户管理页面（新建/编辑/软删除） | CC | P1 | H-054 ✅ | 2026-05-06 08:45 | ✅ | commit 41b4666，CustomerList.vue+router，vite build通过 |
| H-057 | F-06-3: SubPA4 模糊搜索（输入即搜，左右模糊） | CC | P1 | 无 | 2026-05-06 00:53 | ✅ | commit e5ace29，模糊搜索+内存过滤，build通过 |
| H-058 | F-06-4: POST /api/products（新增+自动流水号） | CC | P1 | 无 | 2026-05-06 | ✅ | commit 45dcff9，POST+GenerateProductCode+build通过 |
| H-059 | F-10-2: POST/PUT/DELETE /api/invoice-companies（开票公司CRUD） | CC | P1 | 无 | 2026-05-06 08:45 | ✅ | commit 99ca083，POST+PUT+DELETE+DTO |
| H-060 | F-10-3: GET/POST/PUT /api/user-invoice-permissions（用户开票公司权限配置） | CC | P2 | 无 | 2026-05-06 12:05 | ✅ | commit 新建Controller+DTO，Q-060 6/6 PASS |
| H-061 | F-10-5: 用户-开票公司权限配置页面 | CC | P2 | H-060 ✅ | 2026-05-06 | 🔴 | 完全缺失 |

### 第3轮：F-03 预测填报 + F-04 预测审批

| 任务ID | 描述 | 类型 | 优先级 | 依赖 | 创建时间 | 状态 | 备注 |
|--------|------|------|--------|------|---------|------|------|
| H-062 | F-03-5: 填报时间窗口校验（FillTimeEnd后禁止提交，延期白名单例外） | CC | P0 | 无 | 2026-05-06 12:20 | ✅ | CC proc_256f3f476731，Q-062 2/2 PASS |
| H-063 | F-03-4: POST /api/forecast/submit 关联创建 ApprovalRequest | CC | P0 | 无 | 2026-05-06 12:45 | ✅ | CC proc_c25d3d1f94b3，Q-063 1/1 PASS，approval_requests表记录已创建 |
| H-064 | F-03-3: POST /api/forecast/save-draft 语义明确（DRAFT状态） | CC | P1 | 无 | 2026-05-06 13:10 | ✅ | CC proc_631b84f01e84，文档注释增强，Build 0 错误 |
| H-065 | F-03-10: 复制上期数据功能（同客户+同产品+同月份） | CC | P1 | 无 | 2026-05-06 13:00 | ✅ | CC proc_413a41c40a6b，Q-065 1/1 PASS |
| H-066 | F-03-12: 填报表单（开票公司选择+4度量+校验） | CC | P1 | H-059 🔵 | 2026-05-06 | ✅ | 后端 CreateRecord/SaveDraft/CopyPrevious 均已保存 InvoiceCompanyId，前端行内只读显示 |
| H-067 | F-04-11: 审批列表页（卡片+Tab切换+筛选） | CC | P1 | 无 | 2026-05-06 13:15 | ✅ | 路由改为 `/api/approvals`，新增 `pending`/`submitted` 端点，approve/reject 端点 |
| H-068 | F-04-12: 审批详情页（时间线+操作区：批/驳/调） | CC | P1 | 无 | 2026-05-06 13:35 | ✅ | CC proc_6f9f3f3438d8，approval_request_histories建表+端点+Approval.vue；根因：MySQL表缺失，proc_5aa15a5be975修复，Q-068 4/4 PASS |
| H-069 | F-03-14: E2E 品牌过滤拦截+延期窗口校验 | 小Q | P1 | H-062 ✅ | 2026-05-06 14:25 | ✅ | Q-069 2/2 PASS（S1跳过：单品牌数据），S2时间窗口✅，S3 Submit创建ApprovalRequest✅ |

### 第4轮：F-01/F-09/F-08 收尾

| 任务ID | 描述 | 类型 | 优先级 | 依赖 | 创建时间 | 状态 | 备注 |
|--------|------|------|--------|------|---------|------|------|
| H-071 | F-09-5: EmailQueue 管理页面（队列表+状态+重试） | CC | P1 | 无 | 2026-05-06 | 🔴 | 完全缺失 |
| H-072 | F-08-1: users表新增 brand 字段 | CC | P1 | 无 | 2026-05-06 | 🔴 | 完全缺失 |
| H-073 | F-08-3: 首次SSO登录不存在则拒绝（不自动创建） | CC | P2 | 无 | 2026-05-06 | 🔴 | 当前MicrosoftCallback自动创建 |

---

## ✅ 最近完成（昨天+今天）

| 任务ID | 描述 | 类型 | 完成时间 | 结果 |
|--------|------|------|---------|------|
| H-049 | F-07-7: 组织架构管理页面（新增/编辑/停用） | CC | 2026-05-06 00:27 | commit 7c0732b，OrgChart.vue API端点+role映射+salesRegion/salesDistrict |
| H-048 | F-07-4/5/6: OrgNodes POST/PUT/DELETE API | CC | 2026-05-06 00:20 | commit ac703ed，POST+PUT+DELETE+软删cascade+DTOs |
| H-047 | F-07-1: OrgNodes加sales_region+sales_district字段（Migration） | CC | 2026-05-06 00:16 | commit 0d6b508，Migration创建+applied+build通过 |
| H-050 | F-02-6: 周期删除数据校验（有数据禁止删除） | CC | 2026-05-06 00:02 | commit dbf85d7，ForecastPeriodController加校验 |
| H-070 | F-01-3: Dashboard修正（只含Approved，排除Draft/Submitted） | CC | 2026-05-06 00:03 | commit dbf85d7，DashboardController两处加过滤 |
| H-036 | BUG-019/020/021修复：InvoiceCompany端点+PATCH+isDeleted过滤 | CC | 2026-05-05 22:00 | commit 5a82d54，BUG全修复验证通过 |
| H-031 | T-025 Global Query Filter软删除统一拦截 | CC | 2026-05-04 19:00 | EF Core HasQueryFilter，单元测试PASS×4 |
| H-032 | T-022 审批节点修改权限配置 | CC | 2026-05-04 19:05 | Entity+Migration+Service+Controller+权限检查 |
| H-033 | T-024 审批链自动推进+退回记录保留 | CC | 2026-05-04 19:10 | Approve自动推进，退回ToLevel字段，写入ApprovalHistory |
| H-034 | T-023 多设备登录互斥机制 | CC | 2026-05-04 19:30 | Entity+Migration+Service+Controller，多设备互斥，踢出旧设备 |
| H-035 | T-026 统一错误码体系 | CC | 2026-05-04 21:45 | ErrorCode枚举+AppException+全局中间件，build通过 |

---

## 🚫 阻塞（等 Mark 或外部依赖）

| 任务ID | 描述 | 类型 | 阻塞原因 | 解锁条件 |
|--------|------|------|---------|---------|
